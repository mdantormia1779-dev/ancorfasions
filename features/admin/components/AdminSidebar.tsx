"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Archive,
  Megaphone,
  FileText,
  Headphones,
  CreditCard,
  Truck,
  ShieldCheck,
  Settings,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnchorFashionLogo } from "@/components/shared/logo";
import { LogoutButton } from "@/components/auth/logout-button";

type NavItem = {
  name: string;
  href: string;
};

type NavGroup = {
  name: string;
  icon: any;
  href?: string; // If it's a direct link
  items?: NavItem[]; // If it has sub-items
  allowedRoles?: string[];
};

const navigation: NavGroup[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  {
    name: "Products",
    icon: Package,
    items: [
      { name: "All Products", href: "/admin/products" },
      { name: "Categories", href: "/admin/catalog/categories" },
      { name: "Brands", href: "/admin/catalog/brands" },
      { name: "Collections", href: "/admin/products/collections" },
      { name: "Attributes", href: "/admin/products/attributes" },
      { name: "Reviews", href: "/admin/products/reviews" },
    ],
  },
  {
    name: "Orders",
    icon: ShoppingCart,
    items: [
      { name: "All Orders", href: "/admin/orders" },
      { name: "Pending", href: "/admin/orders/pending" },
      { name: "Processing", href: "/admin/orders/processing" },
      { name: "Completed", href: "/admin/orders/completed" },
      { name: "Cancelled", href: "/admin/orders/cancelled" },
      { name: "Returns", href: "/admin/orders/returns" },
    ],
  },
  {
    name: "Customers",
    icon: Users,
    items: [
      { name: "Customer List", href: "/admin/customers" },
      { name: "Customer Groups", href: "/admin/customers/groups" },
      { name: "Customer Reviews", href: "/admin/customers/reviews" },
    ],
  },
  {
    name: "Inventory",
    icon: Archive,
    items: [
      { name: "Stock", href: "/admin/inventory/stock" },
      { name: "Warehouses", href: "/admin/inventory/warehouses" },
      { name: "Stock Movement", href: "/admin/inventory/movement" },
      { name: "Purchase Orders", href: "/admin/operations/procurement/purchase-orders" },
    ],
  },
  {
    name: "Marketing",
    icon: Megaphone,
    items: [
      { name: "Coupons", href: "/admin/marketing/coupons" },
      { name: "Promotions", href: "/admin/marketing/promotions" },
      { name: "Banners", href: "/admin/cms/banners" },
      { name: "Newsletter", href: "/admin/marketing/newsletter" },
    ],
  },
  {
    name: "Content (CMS)",
    icon: FileText,
    items: [
      { name: "Pages", href: "/admin/cms/pages" },
      { name: "Blog", href: "/admin/cms/blogs" },
      { name: "Media Library", href: "/admin/cms/media" },
      { name: "Menus", href: "/admin/cms/menus" },
    ],
  },
  {
    name: "CRM",
    icon: Headphones,
    items: [
      { name: "Leads", href: "/admin/crm/leads" },
      { name: "Support Tickets", href: "/admin/support/tickets" },
      { name: "Messages", href: "/admin/crm/messages" },
    ],
  },
  {
    name: "Finance",
    icon: CreditCard,
    allowedRoles: ["SUPERADMIN", "ADMIN"],
    items: [
      { name: "Sales Report", href: "/admin/analytics/sales" },
      { name: "Expenses", href: "/admin/finance/expenses" },
      { name: "Transactions", href: "/admin/payments/transactions" },
    ],
  },
  {
    name: "Shipping",
    icon: Truck,
    items: [
      { name: "Couriers", href: "/admin/operations/logistics/couriers" },
      { name: "Tracking", href: "/admin/shipping/tracking" },
      { name: "Shipping Zones", href: "/admin/shipping/zones" },
    ],
  },
  {
    name: "Users & Roles",
    icon: ShieldCheck,
    allowedRoles: ["SUPERADMIN", "ADMIN"],
    items: [
      { name: "Admin Users", href: "/admin/users/admins" },
      { name: "Managers", href: "/admin/users/managers" },
      { name: "Staff", href: "/admin/users/staff" },
      { name: "Permissions", href: "/admin/users/permissions" },
    ],
  },
  {
    name: "Settings",
    icon: Settings,
    allowedRoles: ["SUPERADMIN", "ADMIN"],
    items: [
      { name: "General", href: "/admin/settings/general" },
      { name: "Store", href: "/admin/settings/store" },
      { name: "Payment", href: "/admin/settings/payment" },
      { name: "Email", href: "/admin/settings/email" },
      { name: "SEO", href: "/admin/settings/seo" },
      { name: "Analytics", href: "/admin/settings/analytics" },
      { name: "Security", href: "/admin/security" },
    ],
  },
];

export const AdminSidebar = ({
  className,
  role = "CUSTOMER",
}: {
  className?: string;
  role?: string;
}) => {
  const pathname = usePathname();

  const filteredNavigation = navigation.filter((nav) => {
    if (!nav.allowedRoles) return true;
    return nav.allowedRoles.includes(role);
  });

  // Determine which accordion items should be open by default based on current path
  const defaultOpenValues = filteredNavigation
    .filter((nav) =>
      nav.items?.some(
        (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
      )
    )
    .map((nav) => nav.name);

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white text-slate-900 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <Link href="/admin" className="flex items-center gap-2">
          <AnchorFashionLogo noLink={true} />
          <span className="hidden text-lg font-semibold tracking-tight">
            Admin
          </span>
        </Link>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          <Accordion
            type="multiple"
            defaultValue={defaultOpenValues}
            className="w-full"
          >
            {filteredNavigation.map((group) => {
              const Icon = group.icon;

              // If it's a single link without children
              if (group.href) {
                const isActive =
                  pathname === group.href ||
                  (group.href !== "/admin" &&
                    pathname.startsWith(`${group.href}/`));
                return (
                  <Link
                    key={group.name}
                    href={group.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-slate-100 font-semibold text-slate-900 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] flex-shrink-0",
                        isActive
                          ? "text-slate-900"
                          : "text-slate-500 group-hover:text-slate-700"
                      )}
                    />
                    {group.name}
                  </Link>
                );
              }

              // If it has children (Accordion)
              const hasActiveChild = group.items?.some(
                (item) =>
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
              );

              return (
                <AccordionItem
                  key={group.name}
                  value={group.name}
                  className="border-none"
                >
                  <AccordionTrigger
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:no-underline",
                      hasActiveChild
                        ? "text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className="flex flex-1 items-center gap-3">
                      <Icon
                        className={cn(
                          "h-[18px] w-[18px] flex-shrink-0",
                          hasActiveChild
                            ? "text-slate-900"
                            : "text-slate-500 group-hover:text-slate-700"
                        )}
                      />
                      {group.name}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1 pt-0">
                    <div className="ml-5 mt-1 flex flex-col space-y-1 border-l border-slate-100 pl-9 pr-2">
                      {group.items?.map((item) => {
                        const isSubActive = pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                              "relative rounded-md px-3 py-1.5 text-sm transition-colors",
                              isSubActive
                                ? "bg-slate-100/50 font-medium text-slate-900"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                          >
                            {isSubActive && (
                              <div className="absolute left-[-17px] top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-slate-900" />
                            )}
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </nav>
      </ScrollArea>

      <div className="border-t border-slate-100 bg-slate-50/50 p-4">
        <LogoutButton className="mb-4 w-full" />
        <div className="flex items-center gap-3 px-2 text-xs font-medium text-slate-500">
          <span>v1.0.0-enterprise</span>
        </div>
      </div>
    </div>
  );
};
