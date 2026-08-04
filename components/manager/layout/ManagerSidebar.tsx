"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  Megaphone,
  LayoutTemplate,
  LifeBuoy,
  BarChart3,
  CheckSquare,
  Settings,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogoutButton } from "@/components/auth/logout-button";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/manager",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    href: "/manager/orders",
    icon: ShoppingCart,
  },
  {
    title: "Products",
    href: "/manager/products",
    icon: Package,
  },
  {
    title: "Inventory",
    href: "/manager/inventory",
    icon: Boxes,
  },
  {
    title: "Customers",
    href: "/manager/customers",
    icon: Users,
  },
  {
    title: "Marketing",
    href: "/manager/marketing",
    icon: Megaphone,
  },
  {
    title: "CMS",
    href: "/manager/cms",
    icon: LayoutTemplate,
  },
  {
    title: "Support",
    href: "/manager/support",
    icon: LifeBuoy,
  },
  {
    title: "Reports",
    href: "/manager/reports",
    icon: BarChart3,
  },
  {
    title: "Tasks",
    href: "/manager/tasks",
    icon: CheckSquare,
  },
  {
    title: "Settings",
    href: "/manager/settings",
    icon: Settings,
  },
];

export function ManagerSidebar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 hidden h-screen w-64 flex-shrink-0 border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link
            href="/manager"
            className="flex items-center gap-2 font-semibold"
          >
            <Package className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">
              Anchor Manager
            </span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="grid items-start px-2 py-4 text-sm font-medium lg:px-4">
            <div className="mb-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Operations
            </div>
            {sidebarNavItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 transition-all",
                    pathname === item.href ||
                      (pathname.startsWith(item.href) &&
                        item.href !== "/manager")
                      ? "bg-primary font-medium text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t p-4">
          <LogoutButton className="w-full justify-center" />
        </div>
      </div>
    </div>
  );
}
