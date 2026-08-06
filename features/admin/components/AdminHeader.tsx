"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Bell,
  Search,
  User,
  Menu,
  LogOut,
  Settings,
  Bookmark,
  Moon,
  Sun,
  MessageSquare,
  Home,
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
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const paths = pathname.split("/").filter(Boolean);

  const firstName = user.user_metadata?.first_name || user.user_metadata?.name?.split(" ")[0] || "";
  const lastName = user.user_metadata?.last_name || user.user_metadata?.name?.split(" ").slice(1).join(" ") || "";
  const avatarUrl = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : user.email?.slice(0, 2).toUpperCase() || "AD";
  const displayName =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Admin User";

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

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/admin/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-[80px] w-full items-center justify-between border-b border-slate-100 bg-white dark:bg-background dark:border-border px-4 shadow-sm lg:px-8">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] border-r-0 p-0 bg-white dark:bg-background">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <AdminSidebar
              className="w-full border-r-0 shadow-none"
              role={role}
            />
          </SheetContent>
        </Sheet>

        {/* Breadcrumb Navigation */}
        <div className="hidden flex-col md:flex">
          <h2 className="text-[22px] font-bold tracking-tight text-slate-800 dark:text-slate-100 capitalize">
            {paths.length > 0 ? paths[paths.length - 1].replace(/-/g, ' ') : "Dashboard"}
          </h2>
          <nav className="flex items-center text-xs font-medium text-slate-500 mt-1 gap-2">
            <Home className="h-3 w-3" />
            {paths.map((path, index) => (
              <span key={`${path}-${index}`} className="flex items-center gap-2">
                <span>/</span>
                <span className={index === paths.length - 1 ? "text-[#00A1FF] capitalize" : "capitalize"}>
                  {path.replace(/-/g, ' ')}
                </span>
              </span>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-5">
        {/* Global Search */}
        <div className="relative hidden w-full max-w-[280px] sm:flex lg:max-w-[320px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full h-10 appearance-none rounded-full border-none bg-slate-50/80 dark:bg-slate-800 pl-11 shadow-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 focus-visible:ring-1 focus-visible:ring-slate-300 placeholder:text-slate-400"
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => toast.success("Added to bookmarks")}
            className="h-10 w-10 rounded-full bg-slate-50/80 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700"
          >
            <Bookmark className="h-[18px] w-[18px]" />
          </Button>

          {mounted && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-10 w-10 rounded-full bg-slate-50/80 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700"
            >
              {theme === "dark" ? (
                <Sun className="h-[18px] w-[18px]" />
              ) : (
                <Moon className="h-[18px] w-[18px]" />
              )}
            </Button>
          )}

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-slate-50/80 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 relative"
              />
            }>
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#00A1FF]"></span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 mt-2 rounded-xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-bold flex justify-between items-center">
                  Notifications
                  <span className="text-xs font-normal text-[#00A1FF] cursor-pointer hover:underline">Mark all as read</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                    <span className="font-semibold text-sm">New Order #ORD-8921</span>
                    <span className="text-xs text-muted-foreground">A new order has been placed by Sarah J.</span>
                    <span className="text-[10px] text-muted-foreground mt-1">10 minutes ago</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                    <span className="font-semibold text-sm">Low Stock Alert</span>
                    <span className="text-xs text-muted-foreground">Product "Summer Dress" is running low on stock.</span>
                    <span className="text-[10px] text-muted-foreground mt-1">2 hours ago</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                    <span className="font-semibold text-sm">Server Maintenance</span>
                    <span className="text-xs text-muted-foreground">Scheduled maintenance tonight at 12:00 AM.</span>
                    <span className="text-[10px] text-muted-foreground mt-1">1 day ago</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <div className="p-2 text-center">
                <Link href="/admin/settings/general" className="text-sm text-[#00A1FF] hover:underline">View all notifications</Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Messages Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-slate-50/80 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 relative"
              />
            }>
              <MessageSquare className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#00A1FF]"></span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 mt-2 rounded-xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-bold flex justify-between items-center">
                  Messages
                  <span className="text-xs font-normal text-[#00A1FF] cursor-pointer hover:underline">Mark all as read</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  <DropdownMenuItem className="flex items-start gap-3 p-3 cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">AM</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">Anna Marie</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">Can you check the shipping status?</span>
                      <span className="text-[10px] text-muted-foreground mt-1">Just now</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-start gap-3 p-3 cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">DP</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">David Park</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">The new designs look great!</span>
                      <span className="text-[10px] text-muted-foreground mt-1">1 hour ago</span>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <div className="p-2 text-center">
                <Link href="/admin/settings/general" className="text-sm text-[#00A1FF] hover:underline">View all messages</Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-full hover:opacity-90 focus:outline-none pl-2">
            <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-[#00A1FF] text-white text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden flex-col items-start text-sm md:flex">
              <span className="font-semibold text-slate-700 dark:text-slate-200 leading-none mb-1">{firstName || displayName.split(" ")[0] || 'Admin'}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 leading-none">{role?.toLowerCase() || 'admin'}</span>
            </div>
          </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {displayName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/account/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/admin/settings/general")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
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

