"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, User, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ADMIN_ROLES, MANAGER_ROLES } from "@/lib/constants/auth";

export function MobileBottomNav({ user }: { user: any }) {
  const pathname = usePathname();

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.slice(0, 2).toUpperCase();
    if (email) return email.slice(0, 2).toUpperCase();
    return "U";
  };

  const role = user?.user_metadata?.role || user?.app_metadata?.role || "CUSTOMER";
  const accountHref = !user
    ? "/auth/login"
    : ADMIN_ROLES.includes(role)
      ? "/admin"
      : MANAGER_ROLES.includes(role)
        ? "/manager"
        : "/account/profile";

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Search", href: "/search", icon: Search },
    { label: "Wishlist", href: "/account/wishlist", icon: Heart },
    { label: "Cart", href: "/cart", icon: ShoppingCart },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 h-[72px] w-full border-t border-gray-100 bg-white/90 backdrop-blur-md pb-safe md:hidden">
      <div className="mx-auto grid h-full max-w-lg grid-cols-5 font-medium">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group inline-flex flex-col items-center justify-center px-2 py-1 transition-colors ${
                isActive ? "text-[#1A1A1A]" : "text-gray-400 hover:text-[#1A1A1A]"
              }`}
            >
              <item.icon
                className={`mb-1.5 h-6 w-6 transition-transform duration-300 ${
                  isActive ? "text-[#1A1A1A] scale-110" : ""
                }`}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className={`text-[9px] uppercase tracking-widest transition-colors ${isActive ? 'font-bold text-[#1A1A1A]' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Profile Tab */}
        <Link
          href={accountHref}
          className={`group inline-flex flex-col items-center justify-center px-2 py-1 transition-colors ${
            pathname.includes("/account") || pathname === "/auth/login" || pathname.startsWith("/admin") || pathname.startsWith("/manager")
              ? "text-[#1A1A1A]"
              : "text-gray-400 hover:text-[#1A1A1A]"
          }`}
        >
          {user ? (
            <Avatar className={`mb-1.5 h-6 w-6 border-2 transition-transform duration-300 ${pathname.includes("/account") ? "border-[#1A1A1A] scale-110" : "border-transparent"}`}>
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                {getInitials(user.user_metadata?.full_name, user.email)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <User
              className={`mb-1.5 h-6 w-6 transition-transform duration-300 ${
                pathname === "/auth/login" ? "text-[#1A1A1A] scale-110" : ""
              }`}
              strokeWidth={pathname === "/auth/login" ? 2 : 1.5}
            />
          )}
          <span className={`text-[9px] uppercase tracking-widest transition-colors ${pathname.includes("/account") || pathname === "/auth/login" ? 'font-bold text-[#1A1A1A]' : 'font-medium'}`}>
            {user ? "Profile" : "Login"}
          </span>
        </Link>
      </div>
    </div>
  );
}
