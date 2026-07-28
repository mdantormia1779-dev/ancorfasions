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
    <div className="hidden border-r bg-muted/40 md:block w-64 flex-shrink-0 h-screen sticky top-0">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/manager" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">Anchor Manager</span>
          </Link>
        </div>
        <ScrollArea className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
            <div className="px-3 py-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Operations
            </div>
            {sidebarNavItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 transition-all mb-1",
                    pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/manager')
                      ? "bg-primary text-primary-foreground font-medium shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
}
