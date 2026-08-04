"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Bell, CircleUser, Search, Menu, Sparkles, Sun, Moon, MessageSquare, User, LogOut, Settings } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ManagerSidebar } from "./ManagerSidebar";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function ManagerHeader({ user }: { user?: any }) {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-muted/40 dark:bg-background/80 dark:border-border px-4 backdrop-blur-md lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-72 flex-col p-0 dark:bg-background">
          {/* Mobile sidebar goes here - reusing logic or simple version */}
          <div className="flex h-14 items-center border-b px-4 font-semibold">
            Anchor Manager
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-sm text-muted-foreground">
              Navigation available on desktop.
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        <form>
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Global Enterprise Search..."
              className="h-9 w-full appearance-none rounded-md bg-background dark:bg-slate-900 pl-8 shadow-none focus-visible:ring-primary"
            />
          </div>
        </form>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="hidden gap-2 border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900 sm:flex"
        >
          <Sparkles className="h-4 w-4" />
          Ask Gemini
        </Button>

        {mounted && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle dark mode</span>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" />
          }>
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive"></span>
            <span className="sr-only">Toggle notifications</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 mt-2 rounded-xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-bold flex justify-between items-center">
                Notifications
                <span className="text-xs font-normal text-primary cursor-pointer hover:underline">Mark all as read</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <span className="font-semibold text-sm">New Request #REQ-112</span>
                  <span className="text-xs text-muted-foreground">Store manager submitted a request.</span>
                  <span className="text-[10px] text-muted-foreground mt-1">5 minutes ago</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <span className="font-semibold text-sm">System Update</span>
                  <span className="text-xs text-muted-foreground">Version 2.4.1 is now live.</span>
                  <span className="text-[10px] text-muted-foreground mt-1">1 hour ago</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="p-2 text-center">
              <Link href="#" className="text-sm text-primary hover:underline">View all notifications</Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" />
          }>
            <MessageSquare className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary"></span>
            <span className="sr-only">Toggle messages</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 mt-2 rounded-xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-bold flex justify-between items-center">
                Messages
                <span className="text-xs font-normal text-primary cursor-pointer hover:underline">Mark all as read</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <DropdownMenuItem className="flex items-start gap-3 p-3 cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">SJ</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">Store #4</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">Inventory check completed.</span>
                    <span className="text-[10px] text-muted-foreground mt-1">15 mins ago</span>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="p-2 text-center">
              <Link href="#" className="text-sm text-primary hover:underline">View all messages</Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" />
          }>
            <CircleUser className="h-6 w-6 text-slate-500" />
            <span className="sr-only">Toggle user menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.first_name || user?.user_metadata?.full_name || "Manager User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "manager@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/account/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/manager/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
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
}
