"use client";

import Link from "next/link";
import { Search, ShoppingCart, Heart, User, Menu, ChevronDown, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AnchorFashionLogo } from "@/components/shared/logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!link.dropdown || link.dropdown.length === 0) {
    return (
      <Link
        href={link.href}
        className="relative text-xs font-semibold tracking-[0.1em] uppercase text-[#1A1A1A] hover:text-[#C9A86A] transition-colors py-1 group"
      >
        {link.label}
        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#C9A86A] transition-all duration-300 group-hover:w-full" />
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
      <Link href={link.href} className="flex items-center gap-1 text-xs font-semibold tracking-[0.1em] uppercase text-[#1A1A1A] hover:text-[#C9A86A] transition-colors py-1 group">
        {link.label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180 text-[#C9A86A]" : ""}`}
        />
        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#C9A86A] transition-all duration-300 group-hover:w-full" />
      </Link>

      {/* Dropdown Panel */}
      <div
        className={`absolute left-0 top-full mt-2 w-52 bg-white border border-[#C9A86A]/20 shadow-xl py-2 z-50 transition-all duration-200 origin-top ${
          open ? "opacity-100 scale-y-100 translate-y-0" : "opacity-0 scale-y-95 -translate-y-1 pointer-events-none"
        }`}
      >
        {link.dropdown.map((item: DropdownItem) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-4 py-2.5 text-xs font-medium tracking-widest uppercase text-[#1A1A1A] hover:text-[#C9A86A] hover:bg-[#C9A86A]/5 transition-colors"
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamically build navLinks by inserting Clothing and Accessories with DB categories
  const clothingCategories = dbCategories
    .filter(c => c.slug !== "accessories" && c.slug !== "sale" && c.slug !== "new-in")
    .map(c => ({ label: c.name, href: `/categories/${c.slug}` }));

  const accessoryCategories = dbCategories
    .filter(c => c.slug === "accessories" || c.parent_id === "accessories")
    .map(c => ({ label: c.name, href: `/categories/${c.slug}` }));

  const navLinks = [
    baseNavLinks[0], // Home
    baseNavLinks[1], // Shop
    {
      label: "Clothing",
      href: "/categories",
      dropdown: clothingCategories.length > 0 ? clothingCategories : [
        { label: "Dresses", href: "/categories/dresses" },
        { label: "Tops", href: "/categories/tops" },
      ],
    },
    {
      label: "Accessories",
      href: "/categories/accessories",
      dropdown: accessoryCategories.length > 0 ? accessoryCategories : [
        { label: "Bags", href: "/categories/bags" },
        { label: "Jewellery", href: "/categories/jewellery" },
      ],
    },
    ...baseNavLinks.slice(2) // New In, Sale, About Us, Contact Us
  ];

  return (
    <>
      {/* Topbar for Contact Info */}
      <div className="hidden md:block w-full bg-gray-50 border-b border-gray-100 text-gray-500 text-xs py-1.5">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {contactPhone && (
              <span className="flex items-center gap-1 hover:text-black transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                {contactPhone}
              </span>
            )}
            {contactEmail && (
              <span className="flex items-center gap-1 hover:text-black transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                {contactEmail}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-black transition-colors">About Us</Link>
            <Link href="/contact" className="hover:text-black transition-colors">Store Locator</Link>
          </div>
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="w-full bg-[#0D1B2A] text-white text-center py-2.5 text-[10px] tracking-[0.3em] uppercase font-medium">
        {announcementBar ?? '🚚 Free Shipping On Orders Over ৳999 | Easy Returns & Exchanges'}
      </div>

      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">

          {/* Mobile Hamburger — only rendered after mount to prevent hydration mismatch */}
          {mounted ? (
            <Sheet>
              <SheetTrigger className="md:hidden p-2 text-gray-700 hover:text-black transition-colors">
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
                        className="flex items-center justify-between py-3 px-2 text-base font-medium text-gray-800 hover:text-black border-b border-gray-50"
                      >
                        {link.label}
                        {link.dropdown && <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </Link>
                    </div>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          ) : (
            // Placeholder with exact same dimensions to prevent layout shift
            <button className="md:hidden p-2 text-gray-700" aria-label="Toggle menu">
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Logo — Left */}
          <div className="flex-shrink-0">
            <AnchorFashionLogo />
          </div>

          {/* Desktop Navigation — Center */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <NavItem key={link.label} link={link} />
            ))}
          </nav>

          {/* Action Icons — Right */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-gray-700 hover:text-black transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </button>

            {/* Account */}
            <Link href={user ? "/account/profile" : "/login"} className="p-2 text-gray-700 hover:text-black transition-colors" aria-label="Account">
              {user ? (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                    {(user.user_metadata?.full_name || user.email || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <User className="h-5 w-5" strokeWidth={1.75} />
              )}
            </Link>

            {/* Wishlist */}
            <Link href="/account/wishlist" className="relative p-2 text-gray-700 hover:text-black transition-colors" aria-label="Wishlist">
              <Heart className="h-5 w-5" strokeWidth={1.75} />
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[8px] font-bold text-white">
                0
              </span>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-black transition-colors" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" strokeWidth={1.75} />
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[8px] font-bold text-white">
                0
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div className="w-full max-w-2xl bg-white shadow-2xl rounded-sm">
            <div className="flex items-center px-4 py-3 border-b border-gray-100">
              <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search for dresses, tops, bags..."
                className="flex-1 px-4 py-1 text-base text-gray-800 placeholder-gray-400 focus:outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 text-gray-400 hover:text-black transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {["Dresses", "Kurtas", "Handbags", "Jewellery", "Tops", "Sale"].map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${term.toLowerCase()}`}
                    onClick={() => setSearchOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 hover:bg-black hover:text-white transition-colors rounded-sm"
                  >
                    {term}
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
