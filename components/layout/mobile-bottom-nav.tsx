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
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group transition-colors ${
                isActive ? "text-primary" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <item.icon
                className={`w-5 h-5 mb-1 ${
                  isActive ? "fill-primary text-primary" : ""
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] uppercase tracking-wide">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Profile Tab */}
        <Link
          href={user ? "/account/profile" : "/login"}
          className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group transition-colors ${
            pathname.includes("/account") || pathname === "/login" ? "text-primary" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          {user ? (
            <Avatar className="w-6 h-6 mb-1 border border-gray-200">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                {getInitials(user.user_metadata?.full_name, user.email)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <User
              className={`w-5 h-5 mb-1 ${
                pathname === "/login" ? "fill-primary text-primary" : ""
              }`}
              strokeWidth={pathname === "/login" ? 2.5 : 2}
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
