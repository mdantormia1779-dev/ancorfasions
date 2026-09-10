"use client";

import { useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  UserCheck,
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
      { name: "Executive Dashboard", href: "/admin", icon: LayoutDashboard, allowedRoles: ["SUPERADMIN", "ADMIN"] },
      { name: "Marketing Dashboard", href: "/admin/marketing", icon: LayoutDashboard, allowedRoles: ["MARKETING", "MARKETING_MANAGER"] },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3, allowedRoles: ["SUPERADMIN", "ADMIN", "MANAGER"] },
      { name: "Employee Profile", href: "/admin/profile", icon: UserCheck },
      { name: "Assigned Tasks", href: "/admin/tasks", icon: CheckSquare },
    ],
  },
  {
    title: "MARKETING & CRM",
    items: [
      {
        name: "Marketing",
        icon: Megaphone,
        allowedRoles: ["SUPERADMIN", "ADMIN", "MANAGER", "MARKETING_MANAGER", "MARKETING"],
        items: [
          { name: "Overview", href: "/admin/marketing" },
          { name: "Campaigns", href: "/admin/marketing/campaigns" },
          { name: "Promotions", href: "/admin/marketing/promotions" },
          { name: "Coupons", href: "/admin/marketing/coupons" },
          { name: "Banners", href: "/admin/cms/banners" },
          { name: "Newsletter", href: "/admin/marketing/newsletter" },
        ],
      },
      {
        name: "Content (CMS)",
        icon: FileText,
        allowedRoles: ["SUPERADMIN", "ADMIN", "MANAGER", "MARKETING_MANAGER", "MARKETING"],
        items: [
          { name: "Pages", href: "/admin/cms/pages" },
          { name: "Blog", href: "/admin/cms/blogs" },
          { name: "Media Library", href: "/admin/cms/media" },
          { name: "Menus", href: "/admin/cms/menus" },
        ],
      },
      {
        name: "CRM & Leads",
        icon: Headphones,
        allowedRoles: ["SUPERADMIN", "ADMIN", "MANAGER", "MARKETING_MANAGER", "MARKETING", "SUPPORT"],
        items: [
          { name: "Leads", href: "/admin/crm/leads" },
          { name: "Messages", href: "/admin/crm/messages" },
          { name: "Support Tickets", href: "/admin/support/tickets" },
        ],
      },
    ],
  },
  {
    title: "STORE OPERATIONS",
    items: [
      {
        name: "Products",
        icon: Package,
        allowedRoles: ["SUPERADMIN", "ADMIN", "MANAGER"],
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
        allowedRoles: ["SUPERADMIN", "ADMIN", "MANAGER"],
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
        allowedRoles: ["SUPERADMIN", "ADMIN", "MANAGER", "SUPPORT"],
        items: [
          { name: "Customer List", href: "/admin/customers" },
          { name: "Customer Groups", href: "/admin/customers/groups" },
          { name: "Customer Reviews", href: "/admin/customers/reviews" },
        ],
      },
      {
        name: "Inventory",
        icon: Archive,
        allowedRoles: ["SUPERADMIN", "ADMIN", "MANAGER", "WAREHOUSE_MANAGER"],
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
        allowedRoles: ["SUPERADMIN", "ADMIN", "MANAGER", "WAREHOUSE_MANAGER"],
        items: [
          { name: "Couriers", href: "/admin/operations/logistics/couriers" },
          { name: "Tracking", href: "/admin/shipping/tracking" },
          { name: "Shipping Zones", href: "/admin/shipping/zones" },
        ],
      },
    ],
  },
  {
    title: "SYSTEM & ADMINISTRATION",
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
          { name: "Permissions", href: "/admin/users/roles" },
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "flex h-full flex-shrink-0 flex-col bg-card text-card-foreground shadow-[0_0_20px_rgba(89,102,122,0.05)] transition-all duration-300 relative z-20",
        isCollapsed ? "w-[80px]" : "w-[280px]",
        className
      )}
    >
      <div className={cn("flex items-center py-6 border-b border-border relative", isCollapsed ? "px-0 justify-center" : "px-6 gap-3")}>
        {!isCollapsed && (
          <>
            <AnchorFashionLogo noLink={true} className="text-slate-900" />
          </>
        )}
        {isCollapsed && <AnchorFashionLogo noLink={true} className="text-slate-900 w-8 h-8" />}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-muted"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 py-6">
          {navigation.map((category) => {
            const filteredItems = category.items.filter((nav) => {
              if (!nav.allowedRoles) return true;
              return nav.allowedRoles.includes(role);
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={category.title} className="px-4">
                {!isCollapsed ? (
                  <h4 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                    {category.title}
                  </h4>
                ) : (
                  <div className="mb-2 mt-4 border-t border-muted-foreground/20 w-6 mx-auto first:mt-0 first:border-none" />
                )}
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
                            title={isCollapsed ? group.name : undefined}
                            className={cn(
                              "group flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all",
                              isCollapsed ? "justify-center px-0" : "px-4",
                              isActive
                                ? "bg-[#00A1FF]/10 text-[#00A1FF] relative after:absolute after:right-0 after:top-1/2 after:h-8 after:w-1 after:-translate-y-1/2 after:rounded-l-full after:bg-[#00A1FF]"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-[18px] w-[18px] flex-shrink-0",
                                isActive ? "text-[#00A1FF]" : "text-muted-foreground/80 group-hover:text-muted-foreground"
                              )}
                            />
                            {!isCollapsed && group.name}
                          </Link>
                        );
                      }

                      const hasActiveChild = group.items?.some(
                        (item) =>
                          pathname === item.href || pathname.startsWith(`${item.href}/`)
                      );

                      if (isCollapsed) {
                        return (
                          <div key={group.name} className="relative group/tooltip flex justify-center mb-1">
                            <button
                              title={group.name}
                              className={cn(
                                "group flex w-full items-center justify-center rounded-xl py-2.5 text-sm font-medium transition-all hover:no-underline",
                                hasActiveChild
                                  ? "text-[#00A1FF] bg-[#00A1FF]/10 relative after:absolute after:right-0 after:top-1/2 after:h-8 after:w-1 after:-translate-y-1/2 after:rounded-l-full after:bg-[#00A1FF]"
                                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                              )}
                            >
                               <Icon
                                  className={cn(
                                    "h-[18px] w-[18px] flex-shrink-0",
                                    hasActiveChild ? "text-[#00A1FF]" : "text-muted-foreground/80 group-hover:text-muted-foreground"
                                  )}
                                />
                            </button>
                          </div>
                        );
                      }

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
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
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
                                        : "text-muted-foreground hover:text-foreground"
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
      </div>

      <div className="p-4 border-t border-border flex justify-center">
        {isCollapsed ? (
          <LogoutButton 
            className="w-10 h-10 p-0 justify-center bg-muted/50 hover:bg-slate-100 text-foreground/90 border-none rounded-xl"
            hideText={true}
          />
        ) : (
          <LogoutButton className="w-full bg-muted/50 hover:bg-slate-100 text-foreground/90 border-none" />
        )}
      </div>
    </div>
  );
};

