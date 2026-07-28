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
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnchorFashionLogo } from "@/components/shared/logo";

type NavItem = {
  name: string;
  href: string;
};

type NavGroup = {
  name: string;
  icon: any;
  href?: string; // If it's a direct link
  items?: NavItem[]; // If it has sub-items
};

const navigation: NavGroup[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  {
    name: "Products",
    icon: Package,
    items: [
      { name: "All Products", href: "/admin/products" },
      { name: "Categories", href: "/admin/products/categories" },
      { name: "Brands", href: "/admin/products/brands" },
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
      { name: "Purchase Orders", href: "/admin/inventory/purchase-orders" },
    ],
  },
  {
    name: "Marketing",
    icon: Megaphone,
    items: [
      { name: "Coupons", href: "/admin/marketing/coupons" },
      { name: "Promotions", href: "/admin/marketing/promotions" },
      { name: "Banners", href: "/admin/marketing/banners" },
      { name: "Newsletter", href: "/admin/marketing/newsletter" },
    ],
  },
  {
    name: "Content (CMS)",
    icon: FileText,
    items: [
      { name: "Pages", href: "/admin/cms/pages" },
      { name: "Blog", href: "/admin/cms/blog" },
      { name: "Media Library", href: "/admin/cms/media" },
      { name: "Menus", href: "/admin/cms/menus" },
    ],
  },
  {
    name: "CRM",
    icon: Headphones,
    items: [
      { name: "Leads", href: "/admin/crm/leads" },
      { name: "Support Tickets", href: "/admin/crm/tickets" },
      { name: "Messages", href: "/admin/crm/messages" },
    ],
  },
  {
    name: "Finance",
    icon: CreditCard,
    items: [
      { name: "Sales Report", href: "/admin/finance/sales" },
      { name: "Expenses", href: "/admin/finance/expenses" },
      { name: "Transactions", href: "/admin/finance/transactions" },
    ],
  },
  {
    name: "Shipping",
    icon: Truck,
    items: [
      { name: "Couriers", href: "/admin/shipping/couriers" },
      { name: "Tracking", href: "/admin/shipping/tracking" },
      { name: "Shipping Zones", href: "/admin/shipping/zones" },
    ],
  },
  {
    name: "Users & Roles",
    icon: ShieldCheck,
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
    items: [
      { name: "General", href: "/admin/settings/general" },
      { name: "Store", href: "/admin/settings/store" },
      { name: "Payment", href: "/admin/settings/payment" },
      { name: "Email", href: "/admin/settings/email" },
      { name: "SEO", href: "/admin/settings/seo" },
      { name: "Analytics", href: "/admin/settings/analytics" },
      { name: "Security", href: "/admin/settings/security" },
    ],
  },
];

export const AdminSidebar = ({ className }: { className?: string }) => {
  const pathname = usePathname();

  // Determine which accordion items should be open by default based on current path
  const defaultOpenValues = navigation
    .filter(nav => nav.items?.some(item => pathname === item.href || pathname.startsWith(`${item.href}/`)))
    .map(nav => nav.name);

  return (
    <div className={cn("flex h-full flex-col bg-white border-r border-slate-200 text-slate-900 w-64 flex-shrink-0 shadow-sm", className)}>
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <AnchorFashionLogo />
          <span className="font-semibold text-lg tracking-tight hidden">Admin</span>
        </Link>
      </div>
      
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          <Accordion type="multiple" defaultValue={defaultOpenValues} className="w-full">
            {navigation.map((group) => {
              const Icon = group.icon;

              // If it's a single link without children
              if (group.href) {
                const isActive = pathname === group.href || (group.href !== "/admin" && pathname.startsWith(`${group.href}/`));
                return (
                  <Link
                    key={group.name}
                    href={group.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all group",
                      isActive 
                        ? "bg-slate-100 text-slate-900 shadow-sm font-semibold" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className={cn("h-[18px] w-[18px] flex-shrink-0", isActive ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700")} />
                    {group.name}
                  </Link>
                );
              }

              // If it has children (Accordion)
              const hasActiveChild = group.items?.some(item => pathname === item.href || pathname.startsWith(`${item.href}/`));
              
              return (
                <AccordionItem key={group.name} value={group.name} className="border-none">
                  <AccordionTrigger className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:no-underline group",
                    hasActiveChild ? "text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}>
                    <div className="flex items-center gap-3 flex-1">
                      <Icon className={cn("h-[18px] w-[18px] flex-shrink-0", hasActiveChild ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700")} />
                      {group.name}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1 pt-0">
                    <div className="flex flex-col space-y-1 pl-9 pr-2 border-l border-slate-100 ml-5 mt-1">
                      {group.items?.map((item) => {
                        const isSubActive = pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                              "px-3 py-1.5 text-sm rounded-md transition-colors relative",
                              isSubActive 
                                ? "text-slate-900 font-medium bg-slate-100/50" 
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            )}
                          >
                            {isSubActive && (
                              <div className="absolute left-[-17px] top-1/2 -translate-y-1/2 w-[2px] h-4 bg-slate-900 rounded-r-full" />
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
      
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 px-2 text-xs font-medium text-slate-500">
          <span>v1.0.0-enterprise</span>
        </div>
      </div>
    </div>
  );
};