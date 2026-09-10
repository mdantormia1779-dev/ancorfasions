"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useTransition } from "react";
import {
  Bell,
  Search,
  User,
  Menu,
  LogOut,
  Settings,
  Moon,
  Sun,
  MessageSquare,
  Home,
  X,
  CheckCheck,
  ShoppingCart,
  AlertTriangle,
  Users,
  CreditCard,
  Megaphone,
  Info,
  Mail,
  Inbox,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { AdminSidebar } from "./AdminSidebar";
import { AdminBookmarksMenu } from "./AdminBookmarksMenu";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  getAdminHeaderNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  seedInitialNotificationsIfEmptyAction,
  type AdminNotification,
} from "@/actions/admin/notification.actions";
import {
  getAdminHeaderMessagesAction,
  markAllMessagesAsReadAction,
  seedInitialMessagesIfEmptyAction,
  type AdminMessage,
} from "@/actions/admin/messages.actions";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

const NOTIFICATION_ICON_MAP: Record<string, React.ReactNode> = {
  order: <ShoppingCart className="h-4 w-4 text-violet-500" />,
  inventory: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  customer: <Users className="h-4 w-4 text-sky-500" />,
  payment: <CreditCard className="h-4 w-4 text-red-500" />,
  system: <Info className="h-4 w-4 text-slate-400" />,
  marketing: <Megaphone className="h-4 w-4 text-pink-500" />,
};

function notifIcon(type: string) {
  return NOTIFICATION_ICON_MAP[type?.toLowerCase()] ?? <Bell className="h-4 w-4 text-muted-foreground" />;
}

function msgIcon(type: string) {
  if (type === "EMAIL") return <Mail className="h-4 w-4 text-blue-500" />;
  if (type === "IN_APP") return <MessageCircle className="h-4 w-4 text-violet-500" />;
  return <Inbox className="h-4 w-4 text-muted-foreground" />;
}

function relativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "";
  }
}

function getInitials(first: string, last: string, email?: string): string {
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  return email?.slice(0, 2).toUpperCase() ?? "AD";
}

// ────────────────────────────────────────────────────────────────────────────
// Search autocomplete suggestions by page
// ────────────────────────────────────────────────────────────────────────────
const ADMIN_ROUTES = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Add Product", href: "/admin/products/add" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Marketing", href: "/admin/marketing" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Notifications", href: "/admin/notifications" },
  { label: "Messages", href: "/admin/crm/messages" },
  { label: "Settings", href: "/admin/settings/general" },
  { label: "Staff", href: "/admin/staff" },
  { label: "CRM", href: "/admin/crm" },
  { label: "Support Tickets", href: "/admin/crm/support" },
  { label: "Campaigns", href: "/admin/marketing/campaigns" },
  { label: "Reports", href: "/admin/analytics/reports" },
];

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

interface AdminHeaderProps {
  user: SupabaseUser;
  role?: string;
}

export const AdminHeader = ({ user, role }: AdminHeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<typeof ADMIN_ROUTES>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const [notifLoading, setNotifLoading] = useState(true);

  // Messages
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [msgUnread, setMsgUnread] = useState(0);
  const [msgLoading, setMsgLoading] = useState(true);

  // ── User metadata ──────────────────────────────────────────────────────────
  const firstName = user.user_metadata?.first_name || user.user_metadata?.name?.split(" ")[0] || "";
  const lastName = user.user_metadata?.last_name || user.user_metadata?.name?.split(" ").slice(1).join(" ") || "";
  const avatarUrl = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
  const initials = getInitials(firstName, lastName, user.email);
  const displayName =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Admin User";

  // ── Breadcrumb ──────────────────────────────────────────────────────────────
  const paths = pathname.split("/").filter(Boolean);

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    await seedInitialNotificationsIfEmptyAction();
    const result = await getAdminHeaderNotificationsAction();
    if (!result.error) {
      setNotifications(result.data);
      setNotifUnread(result.unreadCount);
    }
    setNotifLoading(false);
  }, []);

  const fetchMessages = useCallback(async () => {
    setMsgLoading(true);
    await seedInitialMessagesIfEmptyAction();
    const result = await getAdminHeaderMessagesAction();
    if (!result.error) {
      setMessages(result.data);
      setMsgUnread(result.unreadCount);
    }
    setMsgLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchMessages();
  }, [fetchNotifications, fetchMessages]);

  // ── Search ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    setSearchSuggestions(
      ADMIN_ROUTES.filter((r) => r.label.toLowerCase().includes(q) || r.href.includes(q)).slice(0, 6)
    );
  }, [searchQuery]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setSearchFocused(false);
      setSearchQuery("");
      router.push(`/admin/products?search=${encodeURIComponent(searchQuery)}`);
    }
    if (e.key === "Escape") {
      setSearchFocused(false);
      setSearchQuery("");
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to log out. Please try again.");
      return;
    }
    toast.success("Logged out successfully.");
    router.push("/auth/login");
    router.refresh();
  }

  // ── Notification actions ───────────────────────────────────────────────────
  const handleMarkNotifRead = (id: string) => {
    startTransition(async () => {
      await markNotificationAsReadAction(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setNotifUnread((c) => Math.max(0, c - 1));
    });
  };

  const handleMarkAllNotifsRead = () => {
    startTransition(async () => {
      await markAllNotificationsAsReadAction();
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
      setNotifUnread(0);
      toast.success("All notifications marked as read");
    });
  };

  // ── Message actions ────────────────────────────────────────────────────────
  const handleMarkAllMsgsRead = () => {
    startTransition(async () => {
      await markAllMessagesAsReadAction();
      setMessages((prev) => prev.map((m) => ({ ...m, status: "READ" })));
      setMsgUnread(0);
      toast.success("All messages marked as read");
    });
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <header className="sticky top-0 z-30 flex h-[80px] w-full items-center justify-between border-b border-slate-100 bg-white dark:bg-background dark:border-border px-4 shadow-sm lg:px-8">
      {/* ── Left: mobile menu + breadcrumb ── */}
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] border-r-0 p-0 bg-white dark:bg-background">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <AdminSidebar className="w-full border-r-0 shadow-none" role={role} />
          </SheetContent>
        </Sheet>

        <div className="hidden flex-col md:flex">
          <h2 className="text-[22px] font-bold tracking-tight text-slate-800 dark:text-slate-100 capitalize">
            {paths.length > 0 ? paths[paths.length - 1].replace(/-/g, " ") : "Dashboard"}
          </h2>
          <nav className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 gap-2">
            <Home className="h-3 w-3" />
            {paths.map((path, index) => (
              <span key={`${path}-${index}`} className="flex items-center gap-2">
                <span>/</span>
                <span className={index === paths.length - 1 ? "text-[#00A1FF] capitalize" : "capitalize"}>
                  {path.replace(/-/g, " ")}
                </span>
              </span>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Right: actions ── */}
      <div className="flex items-center gap-3 lg:gap-4">

        {/* Global Search with autocomplete */}
        <div className="relative hidden w-full max-w-[280px] sm:flex lg:max-w-[320px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search pages, products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            className="w-full h-10 appearance-none rounded-full border-none bg-slate-50/80 dark:bg-slate-800 pl-11 pr-4 shadow-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 focus-visible:ring-1 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {/* Autocomplete dropdown */}
          {searchFocused && searchSuggestions.length > 0 && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
              {searchSuggestions.map((s) => (
                <button
                  key={s.href}
                  onMouseDown={() => {
                    router.push(s.href);
                    setSearchQuery("");
                    setSearchFocused(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted text-left transition-colors"
                >
                  <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium text-foreground">{s.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground truncate">{s.href}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Icon buttons row */}
        <div className="flex items-center gap-2">

          {/* Bookmarks */}
          <AdminBookmarksMenu />

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-10 w-10 rounded-full bg-slate-50/80 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </Button>
          )}

          {/* ── Notifications Dropdown ── */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-slate-50/80 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 relative"
                  title="Notifications"
                />
              }
            >
              <Bell className="h-[18px] w-[18px]" />
              {notifUnread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-4 w-4 rounded-full bg-[#00A1FF] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                  {notifUnread > 9 ? "9+" : notifUnread}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[340px] mt-2 rounded-xl p-0">
              <DropdownMenuLabel className="px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[#00A1FF]" />
                  <span className="font-bold text-sm">Notifications</span>
                  {notifUnread > 0 && (
                    <span className="text-[10px] bg-[#00A1FF] text-white rounded-full px-1.5 py-0.5 font-bold">
                      {notifUnread}
                    </span>
                  )}
                </div>
                {notifUnread > 0 && (
                  <button
                    onClick={handleMarkAllNotifsRead}
                    disabled={isPending}
                    className="flex items-center gap-1 text-xs font-normal text-[#00A1FF] hover:underline disabled:opacity-50"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="m-0" />
              <div className="max-h-[340px] overflow-y-auto">
                {notifLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>No notifications yet.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => !n.read_at && handleMarkNotifRead(n.id)}
                      className={cn(
                        "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 border-b border-border/50 last:border-0",
                        !n.read_at && "bg-[#00A1FF]/5"
                      )}
                    >
                      <div className="mt-0.5 h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        {notifIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn("text-sm font-semibold truncate", !n.read_at ? "text-foreground" : "text-foreground/70")}>
                            {n.title}
                          </span>
                          {!n.read_at && (
                            <span className="h-2 w-2 rounded-full bg-[#00A1FF] shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                          {relativeTime(n.created_at)}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <DropdownMenuSeparator className="m-0" />
              <div className="p-2.5 text-center">
                <Link
                  href="/admin/notifications"
                  className="text-sm text-[#00A1FF] hover:underline font-medium"
                >
                  View all notifications →
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ── Messages Dropdown ── */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-slate-50/80 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 relative"
                  title="Messages"
                />
              }
            >
              <MessageSquare className="h-[18px] w-[18px]" />
              {msgUnread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-4 w-4 rounded-full bg-[#00A1FF] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                  {msgUnread > 9 ? "9+" : msgUnread}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[340px] mt-2 rounded-xl p-0">
              <DropdownMenuLabel className="px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#00A1FF]" />
                  <span className="font-bold text-sm">Messages</span>
                  {msgUnread > 0 && (
                    <span className="text-[10px] bg-[#00A1FF] text-white rounded-full px-1.5 py-0.5 font-bold">
                      {msgUnread}
                    </span>
                  )}
                </div>
                {msgUnread > 0 && (
                  <button
                    onClick={handleMarkAllMsgsRead}
                    disabled={isPending}
                    className="flex items-center gap-1 text-xs font-normal text-[#00A1FF] hover:underline disabled:opacity-50"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="m-0" />
              <div className="max-h-[340px] overflow-y-auto">
                {msgLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>No messages yet.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isUnread = m.status !== "READ";
                    const senderName =
                      m.profile
                        ? `${m.profile.first_name ?? ""} ${m.profile.last_name ?? ""}`.trim() || "Customer"
                        : "Customer";
                    const senderInitials = senderName.slice(0, 2).toUpperCase();
                    return (
                      <div
                        key={m.id}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 transition-colors hover:bg-muted/60",
                          isUnread && "bg-[#00A1FF]/5"
                        )}
                      >
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-xs font-bold">
                            {senderInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn("text-sm font-semibold truncate", !isUnread && "text-foreground/70")}>
                              {senderName}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {msgIcon(m.type)}
                              {isUnread && <span className="h-2 w-2 rounded-full bg-[#00A1FF]" />}
                            </div>
                          </div>
                          {m.subject && (
                            <p className="text-xs font-medium text-foreground/80 truncate mt-0.5">{m.subject}</p>
                          )}
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {m.content ?? "No content"}
                          </p>
                          <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                            {relativeTime(m.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <DropdownMenuSeparator className="m-0" />
              <div className="p-2.5 text-center">
                <Link
                  href="/admin/crm/messages"
                  className="text-sm text-[#00A1FF] hover:underline font-medium"
                >
                  View all messages →
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ── User Profile Dropdown ── */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-full hover:opacity-90 focus:outline-none pl-2">
            <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-[#00A1FF] text-white text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden flex-col items-start text-sm md:flex">
              <span className="font-semibold text-slate-700 dark:text-slate-200 leading-none mb-1">
                {firstName || displayName.split(" ")[0] || "Admin"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 leading-none capitalize">
                {role?.toLowerCase() || "admin"}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/admin/profile")}>
                <User className="mr-2 h-4 w-4" />
                Employee Profile
              </DropdownMenuItem>
              {role && ["SUPERADMIN", "ADMIN"].includes(role) && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/admin/settings/general")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
