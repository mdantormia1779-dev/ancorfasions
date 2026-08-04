"use client";

import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  ChevronDown,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AnchorFashionLogo } from "@/components/shared/logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ADMIN_ROLES, MANAGER_ROLES } from "@/lib/constants/auth";

const baseNavLinks = [
  { label: "Home", href: "/" },
  {
    label: "Shop",
    href: "/products",
    dropdown: [
      { label: "New Arrivals", href: "/products?sort=newest" },
      { label: "Best Sellers", href: "/products?sort=rating" },
      { label: "Sale", href: "/categories/sale" },
      { label: "All Products", href: "/products" },
    ],
  },
  // Clothing and Accessories will be injected dynamically
  { label: "New In", href: "/products?sort=newest" },
  { label: "Sale", href: "/categories/sale" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
}

interface DropdownItem {
  label: string;
  href: string;
}

function NavItem({ link }: { link: any }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!link.dropdown || link.dropdown.length === 0) {
    return (
      <Link
        href={link.href}
        className="group relative py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#1A1A1A] transition-colors hover:text-[#C9A86A]"
      >
        {link.label}
        <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-[#C9A86A] transition-all duration-300 group-hover:w-full" />
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={link.href}
        className="group flex items-center gap-1 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#1A1A1A] transition-colors hover:text-[#C9A86A]"
      >
        {link.label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180 text-[#C9A86A]" : ""}`}
        />
        <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-[#C9A86A] transition-all duration-300 group-hover:w-full" />
      </Link>

      {/* Dropdown Panel */}
      <div
        className={`absolute left-0 top-full z-50 mt-2 w-52 origin-top border border-[#C9A86A]/20 bg-white py-2 shadow-xl transition-all duration-200 ${
          open
            ? "translate-y-0 scale-y-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-y-95 opacity-0"
        }`}
      >
        {link.dropdown.map((item: DropdownItem) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-[#1A1A1A] transition-colors hover:bg-[#C9A86A]/5 hover:text-[#C9A86A]"
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function StoreHeader({
  dbCategories = [],
  contactPhone,
  contactEmail,
  announcementBar,
  user,
}: {
  dbCategories?: Category[];
  contactPhone?: string;
  contactEmail?: string;
  announcementBar?: string;
  user?: any;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);

  const role = user?.user_metadata?.role || user?.app_metadata?.role || "CUSTOMER";
  const accountHref = !user
    ? "/auth/login"
    : ADMIN_ROLES.includes(role)
      ? "/admin"
      : MANAGER_ROLES.includes(role)
        ? "/manager"
        : "/account/profile";

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsScrollingDown(true);
      } else {
        setIsScrollingDown(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dynamically build navLinks by inserting Clothing and Accessories with DB categories
  const clothingCategories = dbCategories
    .filter(
      (c) =>
        c.slug !== "accessories" && c.slug !== "sale" && c.slug !== "new-in"
    )
    .map((c) => ({ label: c.name, href: `/categories/${c.slug}` }));

  const accessoryCategories = dbCategories
    .filter((c) => c.slug === "accessories" || c.parent_id === "accessories")
    .map((c) => ({ label: c.name, href: `/categories/${c.slug}` }));

  const navLinks = [
    baseNavLinks[0], // Home
    baseNavLinks[1], // Shop
    {
      label: "Clothing",
      href: "/categories",
      dropdown:
        clothingCategories.length > 0
          ? clothingCategories
          : [
              { label: "Dresses", href: "/categories/dresses" },
              { label: "Tops", href: "/categories/tops" },
            ],
    },
    {
      label: "Accessories",
      href: "/categories/accessories",
      dropdown:
        accessoryCategories.length > 0
          ? accessoryCategories
          : [
              { label: "Bags", href: "/categories/bags" },
              { label: "Jewellery", href: "/categories/jewellery" },
            ],
    },
    ...baseNavLinks.slice(2), // New In, Sale, About Us, Contact Us
  ];

  return (
    <>
      {/* Topbar for Contact Info */}
      <div className="hidden w-full border-b border-gray-100 bg-gray-50 py-1.5 text-xs text-gray-500 md:block">
        <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            {contactPhone && (
              <span className="flex cursor-pointer items-center gap-1 transition-colors hover:text-black">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                {contactPhone}
              </span>
            )}
            {contactEmail && (
              <span className="flex cursor-pointer items-center gap-1 transition-colors hover:text-black">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                {contactEmail}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="transition-colors hover:text-black">
              About Us
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-black"
            >
              Store Locator
            </Link>
          </div>
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="w-full bg-[#0D1B2A] py-2.5 text-center text-[10px] font-medium uppercase tracking-[0.3em] text-white">
        {announcementBar ??
          "🚚 Free Shipping On Orders Over ৳999 | Easy Returns & Exchanges"}
      </div>

      <header 
        className={`sticky top-0 z-50 w-full border-b border-gray-100 bg-white/85 backdrop-blur-md shadow-sm transition-transform duration-300 ${
          isScrollingDown ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* Mobile Hamburger — only rendered after mount to prevent hydration mismatch */}
          {mounted ? (
            <Sheet>
              <SheetTrigger className="p-2 text-gray-700 transition-colors hover:text-black md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <div className="mb-8 mt-2">
                  <AnchorFashionLogo />
                </div>
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <div key={link.label}>
                      <Link
                        href={link.href}
                        className="flex items-center justify-between border-b border-gray-50 px-2 py-3 text-base font-medium text-gray-800 hover:text-black"
                      >
                        {link.label}
                        {link.dropdown && (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </Link>
                    </div>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          ) : (
            // Placeholder with exact same dimensions to prevent layout shift
            <button
              className="p-2 text-gray-700 md:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Logo — Left */}
          <div className="flex-1 md:flex-none ml-2 md:ml-0 overflow-hidden flex items-center justify-start sm:justify-center md:justify-start">
            <AnchorFashionLogo className="w-full max-w-[140px] sm:max-w-[180px] md:max-w-[220px] lg:max-w-[280px]" />
          </div>

          {/* Desktop Navigation — Center */}
          <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
            {navLinks.map((link) => (
              <NavItem key={link.label} link={link} />
            ))}
          </nav>

          {/* Action Icons — Right */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-gray-700 transition-colors hover:text-black"
              aria-label="Search"
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </button>

            {/* Account */}
            <Link
              href={accountHref}
              className="p-2 text-gray-700 transition-colors hover:text-black"
              aria-label="Account"
            >
              {user ? (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                    {(user.user_metadata?.full_name || user.email || "U")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <User className="h-5 w-5" strokeWidth={1.75} />
              )}
            </Link>

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="relative p-2 text-gray-700 transition-colors hover:text-black"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" strokeWidth={1.75} />
              <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[8px] font-bold text-white">
                0
              </span>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 transition-colors hover:text-black"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={1.75} />
              <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[8px] font-bold text-white">
                0
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Premium Full-Screen Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white/95 px-4 pt-16 backdrop-blur-xl transition-all animate-in fade-in duration-300 md:px-12 md:pt-24 lg:px-24">
          <div className="mx-auto w-full max-w-5xl">
            <div className="flex w-full items-center justify-between border-b-2 border-black/10 pb-4 transition-colors focus-within:border-black">
              <Search className="h-6 w-6 flex-shrink-0 text-gray-400 md:h-8 md:w-8" />
              <input
                autoFocus
                type="text"
                placeholder="Search for elegant pieces..."
                className="flex-1 bg-transparent px-4 py-2 font-serif text-2xl text-gray-900 placeholder-gray-300 focus:outline-none md:text-4xl"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="group flex items-center justify-center p-2 text-gray-400 transition-colors hover:text-black"
              >
                <X className="h-8 w-8 transition-transform duration-300 group-hover:rotate-90" />
              </button>
            </div>
            
            <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                Popular Categories
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  "Dresses",
                  "Kurtas",
                  "Handbags",
                  "Jewellery",
                  "Tops",
                  "Sale",
                ].map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${term.toLowerCase()}`}
                    onClick={() => setSearchOpen(false)}
                    className="group relative px-2 py-1 text-sm font-medium text-gray-600 transition-colors hover:text-black md:text-base"
                  >
                    <span className="relative z-10">{term}</span>
                    <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-black transition-all duration-300 group-hover:w-full" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
