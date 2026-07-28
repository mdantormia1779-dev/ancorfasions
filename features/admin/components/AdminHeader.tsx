"use client";

import { Bell, Search, User, Menu, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
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
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { AdminSidebar } from "./AdminSidebar";

export const AdminHeader = () => {
  const pathname = usePathname();
  
  // Create a simple breadcrumb from the pathname
  const paths = pathname.split('/').filter(Boolean);
  
  return (
    <header className="sticky top-0 z-30 flex h-14 lg:h-[60px] w-full items-center justify-between border-b bg-white/80 backdrop-blur-md px-4 lg:px-6 shadow-sm">
      <div className="flex flex-1 items-center gap-4">
        
        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <AdminSidebar className="border-r-0 shadow-none w-full" />
          </SheetContent>
        </Sheet>

        {/* Breadcrumb Navigation (Desktop) */}
        <nav className="hidden md:flex items-center text-sm font-medium text-slate-500">
          {paths.map((path, index) => {
            const isLast = index === paths.length - 1;
            const formattedPath = path.charAt(0).toUpperCase() + path.slice(1);
            return (
              <div key={path} className="flex items-center">
                {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-slate-400" />}
                <span className={isLast ? "text-slate-900" : ""}>{formattedPath}</span>
              </div>
            );
          })}
        </nav>
      </div>
      
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Global Search */}
        <div className="relative hidden sm:flex w-full max-w-[250px] lg:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full appearance-none bg-slate-50 border-slate-200 pl-9 rounded-full focus-visible:ring-1 focus-visible:ring-slate-400 shadow-none transition-colors hover:bg-slate-100/50"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-2.5 hidden h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium opacity-100 lg:flex text-slate-500">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-slate-100">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600 border-2 border-white"></span>
          <span className="sr-only">Notifications</span>
        </Button>
        
        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 hover:opacity-90 transition-opacity focus:outline-none ring-2 ring-transparent focus:ring-slate-200">
            <span className="text-xs font-medium text-white">AD</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs leading-none text-muted-foreground">admin@anchorfashion.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};