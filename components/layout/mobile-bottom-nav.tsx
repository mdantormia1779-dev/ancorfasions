"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, User, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MobileBottomNav({ user }: { user: any }) {
  const pathname = usePathname();

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.slice(0, 2).toUpperCase();
    if (email) return email.slice(0, 2).toUpperCase();
    return "U";
  };

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Search", href: "/search", icon: Search },
    { label: "Wishlist", href: "/account/wishlist", icon: Heart },
    { label: "Cart", href: "/cart", icon: ShoppingCart },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 h-16 w-full border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden">
      <div className="mx-auto grid h-full max-w-lg grid-cols-5 font-medium">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group inline-flex flex-col items-center justify-center px-5 transition-colors hover:bg-gray-50 ${
                isActive ? "text-primary" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <item.icon
                className={`mb-1 h-5 w-5 ${
                  isActive ? "fill-primary text-primary" : ""
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] uppercase tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Profile Tab */}
        <Link
          href={user ? "/account/profile" : "/auth/login"}
          className={`group inline-flex flex-col items-center justify-center px-5 transition-colors hover:bg-gray-50 ${
            pathname.includes("/account") || pathname === "/auth/login"
              ? "text-primary"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          {user ? (
            <Avatar className="mb-1 h-6 w-6 border border-gray-200">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                {getInitials(user.user_metadata?.full_name, user.email)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <User
              className={`mb-1 h-5 w-5 ${
                pathname === "/auth/login" ? "fill-primary text-primary" : ""
              }`}
              strokeWidth={pathname === "/auth/login" ? 2.5 : 2}
            />
          )}
          <span className="text-[10px] uppercase tracking-wide">
            {user ? "Profile" : "Login"}
          </span>
        </Link>
      </div>
    </div>
  );
}
