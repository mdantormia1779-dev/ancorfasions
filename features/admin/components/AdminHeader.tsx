"use client";

import {
  Bell,
  Search,
  User,
  Menu,
  ChevronRight,
  LogOut,
  Settings,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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

interface AdminHeaderProps {
  user: SupabaseUser;
  role?: string;
}

export const AdminHeader = ({ user, role }: AdminHeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Create a simple breadcrumb from the pathname
  const paths = pathname.split("/").filter(Boolean);

  // Get initials from user name or email
  const firstName = user.user_metadata?.first_name || "";
  const lastName = user.user_metadata?.last_name || "";
  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : user.email?.slice(0, 2).toUpperCase() || "AD";
  const displayName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : user.email || "Admin User";

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

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b bg-white/80 px-4 shadow-sm backdrop-blur-md lg:h-[60px] lg:px-6">
      <div className="flex flex-1 items-center gap-4">
        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-r-0 p-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <AdminSidebar
              className="w-full border-r-0 shadow-none"
              role={role}
            />
          </SheetContent>
        </Sheet>

        {/* Breadcrumb Navigation (Desktop) */}
        <nav className="hidden items-center text-sm font-medium text-slate-500 md:flex">
          {paths.map((path, index) => {
            const isLast = index === paths.length - 1;
            const formattedPath = path.charAt(0).toUpperCase() + path.slice(1);
            return (
              <div key={path} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="mx-1 h-4 w-4 text-slate-400" />
                )}
                <span className={isLast ? "text-slate-900" : ""}>
                  {formattedPath}
                </span>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        {/* Global Search */}
        <div className="relative hidden w-full max-w-[250px] sm:flex lg:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full appearance-none rounded-full border-slate-200 bg-slate-50 pl-9 shadow-none transition-colors hover:bg-slate-100/50 focus-visible:ring-1 focus-visible:ring-slate-400"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-2.5 hidden h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100 lg:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-slate-100"
        >
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-blue-600"></span>
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 ring-2 ring-transparent transition-opacity hover:opacity-90 focus:outline-none focus:ring-slate-200">
            <span className="text-xs font-medium text-white">{initials}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
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
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
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
