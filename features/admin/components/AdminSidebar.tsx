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
  href?: string;
  items?: NavItem[];
  allowedRoles?: string[];
};

type NavCategory = {
  title: string;
  items: NavGroup[];
};

const navigation: NavCategory[] = [
  {
    title: "GENERAL",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "APPLICATIONS",
    items: [
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
        name: "Shipping",
        icon: Truck,
        items: [
          { name: "Couriers", href: "/admin/operations/logistics/couriers" },
          { name: "Tracking", href: "/admin/shipping/tracking" },
          { name: "Shipping Zones", href: "/admin/shipping/zones" },
        ],
      },
    ],
  },
  {
    title: "FORMS & TABLE",
    items: [
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
    ],
  },
  {
    title: "MISCELLANEOUS",
    items: [
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

  return (
    <div
      className={cn(
        "flex h-full w-[280px] flex-shrink-0 flex-col bg-card text-card-foreground shadow-[0_0_20px_rgba(89,102,122,0.05)]",
        className
      )}
    >
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <AnchorFashionLogo noLink={true} className="text-slate-900" />
        <span className="text-xl font-bold tracking-tight text-slate-900">Mofi</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 py-6">
          {navigation.map((category) => {
            const filteredItems = category.items.filter((nav) => {
              if (!nav.allowedRoles) return true;
              return nav.allowedRoles.includes(role);
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={category.title} className="px-4">
                <h4 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                  {category.title}
                </h4>
                <div className="space-y-1">
                  <Accordion type="multiple" className="w-full">
                    {filteredItems.map((group) => {
                      const Icon = group.icon;

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
                              "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                              isActive
                                ? "bg-[#00A1FF]/10 text-[#00A1FF] relative after:absolute after:right-0 after:top-1/2 after:h-8 after:w-1 after:-translate-y-1/2 after:rounded-l-full after:bg-[#00A1FF]"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-slate-900"
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-[18px] w-[18px] flex-shrink-0",
                                isActive ? "text-[#00A1FF]" : "text-muted-foreground/80 group-hover:text-muted-foreground"
                              )}
                            />
                            {group.name}
                          </Link>
                        );
                      }

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
                              "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:no-underline",
                              hasActiveChild
                                ? "text-[#00A1FF] bg-[#00A1FF]/10 relative after:absolute after:right-0 after:top-1/2 after:h-8 after:w-1 after:-translate-y-1/2 after:rounded-l-full after:bg-[#00A1FF]"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-slate-900"
                            )}
                          >
                            <div className="flex flex-1 items-center gap-3">
                              <Icon
                                className={cn(
                                  "h-[18px] w-[18px] flex-shrink-0",
                                  hasActiveChild ? "text-[#00A1FF]" : "text-muted-foreground/80 group-hover:text-muted-foreground"
                                )}
                              />
                              {group.name}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-1 pt-1">
                            <div className="ml-10 mt-1 flex flex-col space-y-1">
                              {group.items?.map((item) => {
                                const isSubActive = pathname === item.href;
                                return (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                      "relative flex items-center rounded-lg px-3 py-2 text-sm transition-colors",
                                      isSubActive
                                        ? "font-semibold text-[#00A1FF]"
                                        : "text-muted-foreground hover:text-slate-900"
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "mr-3 h-1.5 w-1.5 rounded-full transition-colors",
                                        isSubActive ? "bg-[#00A1FF]" : "bg-slate-300 group-hover:bg-slate-400"
                                      )}
                                    />
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
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <LogoutButton className="w-full bg-muted/50 hover:bg-slate-100 text-foreground/90 border-none" />
      </div>
    </div>
  );
};

