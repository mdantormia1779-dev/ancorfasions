"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  ChevronDown,
  ChevronRight,
  X,
  Phone,
  Mail,
  LogIn,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AnchorFashionLogo } from "@/components/shared/logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ADMIN_ROLES, MANAGER_ROLES } from "@/lib/constants/auth";
import { useCartStore } from "@/stores/use-cart-store";
import { useWishlistStore } from "@/stores/use-wishlist-store";




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

interface NavLinkItem {
  label: string;
  href: string;
  dropdown?: DropdownItem[];
}

function NavItem({ link }: { link: NavLinkItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSale = link.label.toLowerCase() === "sale";

  if (!link.dropdown || link.dropdown.length === 0) {
    return (
      <Link
        href={link.href}
        className={`group relative py-1 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
          isSale
            ? "text-rose-600 hover:text-rose-700"
            : "text-[#1A1A1A] hover:text-[#C9A86A]"
        }`}
      >
        {link.label}
        <span
          className={`absolute -bottom-0.5 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full ${
            isSale ? "bg-rose-600" : "bg-[#C9A86A]"
          }`}
        />
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className="relative py-2"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={link.href}
        className={`group flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
          isSale
            ? "text-rose-600 hover:text-rose-700"
            : "text-[#1A1A1A] hover:text-[#C9A86A]"
        }`}
      >
        <span>{link.label}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${
            open ? "rotate-180 text-[#C9A86A]" : "text-gray-400"
          }`}
        />
        <span
          className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
            open ? "w-full bg-[#C9A86A]" : "w-0 group-hover:w-full bg-[#C9A86A]"
          }`}
        />
      </Link>

      {/* Dropdown Panel with seamless hover bridge */}
      <div
        className={`absolute left-0 top-full z-50 min-w-[220px] origin-top-left transition-all duration-200 ${
          open
            ? "translate-y-0 scale-100 opacity-100 pointer-events-auto"
            : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
        {/* Invisible Bridge to prevent hover dropping */}
        <div className="h-2 w-full" />

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white p-1.5 shadow-2xl ring-1 ring-black/10">
          {link.dropdown.map((item: DropdownItem) => {
            const isHighlighted =
              item.label.toLowerCase().includes("all") ||
              item.label.toLowerCase().includes("new");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isHighlighted
                    ? "text-gray-950 hover:bg-gray-50 hover:text-[#C9A86A]"
                    : "text-gray-700 hover:bg-gray-50 hover:text-[#C9A86A]"
                }`}
                onClick={() => setOpen(false)}
              >
                <span>{item.label}</span>
                <ChevronRight className="h-3 w-3 text-gray-400 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-[#C9A86A]" />
              </Link>
            );
          })}
        </div>
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
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(["Shop"]);
  const [mounted, setMounted] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);

  const { cart, fetchCart, setSheetOpen } = useCartStore();
  const { wishlist, fetchWishlist } = useWishlistStore();
  const cartItemCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const wishlistItemCount = wishlist?.items?.length || 0;

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist]);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 120) {
        setIsScrollingDown(true);
      } else {
        setIsScrollingDown(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const role =
    user?.user_metadata?.role || user?.app_metadata?.role || "CUSTOMER";
  const isAdmin = ADMIN_ROLES.includes(role);
  const isManager = MANAGER_ROLES.includes(role);

  const accountHref = !user
    ? "/auth/login"
    : isAdmin
      ? "/admin"
      : isManager
        ? "/manager"
        : "/account/profile";

  const userDisplayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const userInitials = (
    user?.user_metadata?.full_name ||
    user?.email ||
    "U"
  )
    .slice(0, 2)
    .toUpperCase();

  // Dynamically build navLinks by inserting Clothing and Accessories with DB categories
  const cleanCategories = dbCategories.filter(
    (c) =>
      !c.name.toLowerCase().includes("test") &&
      !c.slug.includes("test") &&
      !c.slug.includes("qa") &&
      c.slug !== "jhkjhkj"
  );

  const clothingCategories = cleanCategories
    .filter(
      (c) =>
        c.slug !== "accessories" &&
        c.slug !== "bags" &&
        c.slug !== "jewellery" &&
        c.slug !== "sale" &&
        c.slug !== "new-in"
    )
    .map((c) => ({ label: c.name, href: `/categories/${c.slug}` }));

  const accessoryCategories = cleanCategories
    .filter(
      (c) =>
        c.slug === "accessories" ||
        c.slug === "bags" ||
        c.slug === "jewellery"
    )
    .map((c) => ({ label: c.name, href: `/categories/${c.slug}` }));

  const navLinks: NavLinkItem[] = [
    { label: "Home", href: "/" },
    {
      label: "Shop",
      href: "/products",
      dropdown: [
        { label: "All Apparel", href: "/products" },
        { label: "New Arrivals", href: "/products?sort=newest" },
        { label: "Best Sellers", href: "/products?sort=rating" },
        { label: "Curated Collections", href: "/collections" },
      ],
    },
    {
      label: "Clothing",
      href: "/categories",
      dropdown:
        clothingCategories.length > 0
          ? [
              ...clothingCategories,
              { label: "View All Clothing", href: "/categories" },
            ]
          : [
              { label: "Dresses", href: "/categories/dresses" },
              { label: "Tops", href: "/categories/tops" },
              { label: "Jeans", href: "/categories/jeans" },
              { label: "View All Clothing", href: "/categories" },
            ],
    },
    {
      label: "Accessories",
      href: "/categories/accessories",
      dropdown:
        accessoryCategories.length > 0
          ? [
              ...accessoryCategories.filter((a) => a.href !== "/categories/accessories"),
              { label: "All Accessories", href: "/categories/accessories" },
            ]
          : [
              { label: "Bags", href: "/categories/bags" },
              { label: "Jewellery", href: "/categories/jewellery" },
              { label: "All Accessories", href: "/categories/accessories" },
            ],
    },
    { label: "Collections", href: "/collections" },
    { label: "Sale", href: "/categories/sale" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Topbar for Contact Info (Desktop & Tablet) */}
      <div className="hidden w-full border-b border-gray-100 bg-gray-50 py-1.5 text-xs text-gray-500 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            {contactPhone && (
              <a
                href={`tel:${contactPhone}`}
                className="flex items-center gap-1.5 transition-colors hover:text-black"
              >
                <Phone className="h-3 w-3 text-[#C9A86A]" />
                <span>{contactPhone}</span>
              </a>
            )}
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-1.5 transition-colors hover:text-black"
              >
                <Mail className="h-3 w-3 text-[#C9A86A]" />
                <span>{contactEmail}</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-5">
            <Link href="/blog" className="transition-colors hover:text-black">
              Blog
            </Link>
            <Link href="/about" className="transition-colors hover:text-black">
              About Us
            </Link>
            <Link href="/contact" className="transition-colors hover:text-black">
              Store Locator
            </Link>
          </div>
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="w-full bg-[#0D1B2A] px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-white sm:py-2.5 sm:text-xs sm:tracking-[0.25em]">
        <div className="mx-auto max-w-7xl truncate">
          {announcementBar ??
            "🚚 Free Shipping On Orders Over ৳999 | Easy Returns & Exchanges"}
        </div>
      </div>

      {/* Sticky Main Header */}
      <header
        className={`sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md shadow-sm transition-transform duration-300 ${
          isScrollingDown ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Mobile & Tablet Hamburger (visible below xl breakpoint) */}
          <div className="flex items-center xl:hidden">
            {mounted ? (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black focus:outline-none"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="flex h-full w-[85vw] max-w-sm flex-col p-0 bg-white border-r border-gray-200"
                >
                  <SheetHeader className="border-b border-gray-100 px-5 py-4 text-left">
                    <div className="flex items-center justify-between">
                      <AnchorFashionLogo
                        noLink
                        className="w-full max-w-[140px] sm:max-w-[160px]"
                      />
                    </div>
                    <SheetTitle className="sr-only">Store Navigation</SheetTitle>
                    <SheetDescription className="sr-only">
                      Browse categories, collections and your account
                    </SheetDescription>
                  </SheetHeader>

                  {/* Mobile Account Banner */}
                  <div className="border-b border-gray-100 bg-gray-50/75 px-5 py-3.5">
                    {user ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-9 w-9 border border-[#C9A86A]/40 flex-shrink-0">
                            <AvatarImage src={user.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-[#0D1B2A] text-[10px] font-bold text-white">
                              {userInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {userDisplayName}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={accountHref}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-1 rounded bg-[#0D1B2A] px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-black flex-shrink-0"
                        >
                          {isAdmin ? (
                            <>
                              <ShieldCheck className="h-3 w-3" />
                              <span>Admin</span>
                            </>
                          ) : isManager ? (
                            <>
                              <LayoutDashboard className="h-3 w-3" />
                              <span>Portal</span>
                            </>
                          ) : (
                            <span>Profile</span>
                          )}
                        </Link>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-900">
                            Welcome
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Sign in for orders & rewards
                          </p>
                        </div>
                        <Link
                          href="/auth/login"
                          onClick={() => setMobileMenuOpen(false)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#0D1B2A] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-black"
                        >
                          <LogIn className="h-3.5 w-3.5" />
                          <span>Sign In</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Navigation Links Accordion */}
                  <nav className="flex-1 overflow-y-auto px-4 py-2">
                    <div className="divide-y divide-gray-50">
                      {navLinks.map((link) => {
                        const hasDropdown =
                          Boolean(link.dropdown && link.dropdown.length > 0);
                        const isExpanded = expandedItems.includes(link.label);
                        const isSale = link.label.toLowerCase() === "sale";

                        return (
                          <div key={link.label} className="py-1">
                            {hasDropdown ? (
                              <div>
                                <div className="flex items-center justify-between">
                                  <Link
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex-1 py-2.5 text-sm font-semibold uppercase tracking-wider text-gray-800 transition-colors hover:text-[#C9A86A]"
                                  >
                                    {link.label}
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => toggleExpand(link.label)}
                                    className="p-2 text-gray-400 hover:text-black"
                                    aria-label={`Toggle ${link.label} subcategories`}
                                  >
                                    <ChevronDown
                                      className={`h-4 w-4 transition-transform duration-200 ${
                                        isExpanded
                                          ? "rotate-180 text-[#C9A86A]"
                                          : ""
                                      }`}
                                    />
                                  </button>
                                </div>

                                {isExpanded && link.dropdown && (
                                  <div className="mb-2 space-y-1 rounded-md bg-gray-50/80 px-3 py-2">
                                    {link.dropdown.map((subItem) => (
                                      <Link
                                        key={subItem.href}
                                        href={subItem.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block py-1.5 text-xs font-medium uppercase tracking-wider text-gray-600 transition-colors hover:text-[#C9A86A]"
                                      >
                                        {subItem.label}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Link
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center justify-between py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
                                  isSale
                                    ? "text-rose-600 font-bold hover:text-rose-700"
                                    : "text-gray-800 hover:text-[#C9A86A]"
                                }`}
                              >
                                <span>{link.label}</span>
                                {isSale && (
                                  <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-normal text-rose-600">
                                    Hot
                                  </span>
                                )}
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </nav>

                  {/* Mobile Drawer Footer Contacts */}
                  <div className="border-t border-gray-100 bg-gray-50/60 p-4 space-y-2 text-xs text-gray-600">
                    {contactPhone && (
                      <a
                        href={`tel:${contactPhone}`}
                        className="flex items-center gap-2 transition hover:text-black"
                      >
                        <Phone className="h-3.5 w-3.5 text-[#C9A86A]" />
                        <span>{contactPhone}</span>
                      </a>
                    )}
                    {contactEmail && (
                      <a
                        href={`mailto:${contactEmail}`}
                        className="flex items-center gap-2 transition hover:text-black"
                      >
                        <Mail className="h-3.5 w-3.5 text-[#C9A86A]" />
                        <span className="truncate">{contactEmail}</span>
                      </a>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-[11px] text-gray-500">
                      <Link
                        href="/about"
                        onClick={() => setMobileMenuOpen(false)}
                        className="hover:text-black"
                      >
                        About Us
                      </Link>
                      <Link
                        href="/blog"
                        onClick={() => setMobileMenuOpen(false)}
                        className="hover:text-black"
                      >
                        Blog
                      </Link>
                      <Link
                        href="/contact"
                        onClick={() => setMobileMenuOpen(false)}
                        className="hover:text-black"
                      >
                        Contact
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-700"
                aria-label="Toggle menu placeholder"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            )}
          </div>

          {/* Logo — Center on Mobile, Left on Desktop */}
          <div className="flex flex-1 items-center justify-center px-2 md:justify-start xl:flex-none">
            <AnchorFashionLogo className="w-full max-w-[130px] sm:max-w-[160px] md:max-w-[190px] xl:max-w-[230px]" />
          </div>

          {/* Desktop Navigation (visible only on xl screens to guarantee ample breathing room) */}
          <nav className="hidden items-center gap-6 xl:flex 2xl:gap-8">
            {navLinks.map((link) => (
              <NavItem key={link.label} link={link} />
            ))}
          </nav>

          {/* Action Icons — Right */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black active:scale-95"
              aria-label="Search store"
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </button>

            {/* Account (hidden on tiny screens, fully accessible in bottom-nav and drawer) */}
            <Link
              href={accountHref}
              className="hidden sm:flex rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black active:scale-95"
              aria-label="My Account"
            >
              {user ? (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-[#0D1B2A] text-[9px] font-bold text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <User className="h-5 w-5" strokeWidth={1.75} />
              )}
            </Link>

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="relative rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black active:scale-95"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" strokeWidth={1.75} />
              {mounted && wishlistItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C9A86A] px-1 text-[9px] font-bold text-white shadow-sm animate-in zoom-in-50">
                  {wishlistItemCount > 99 ? "99+" : wishlistItemCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="relative rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black active:scale-95"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={1.75} />
              {mounted && cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0D1B2A] px-1 text-[9px] font-bold text-white shadow-sm animate-in zoom-in-50">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Functional Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white/95 px-4 pt-12 sm:pt-16 backdrop-blur-xl transition-all animate-in fade-in duration-300 md:px-12 md:pt-24 lg:px-24">
          <div className="mx-auto w-full max-w-4xl">
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full items-center justify-between border-b-2 border-black/15 pb-3 transition-colors focus-within:border-black"
            >
              <Search className="h-5 w-5 sm:h-7 sm:w-7 flex-shrink-0 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, collections, brands..."
                className="flex-1 bg-transparent px-3 py-1 font-serif text-xl sm:text-2xl md:text-3xl text-gray-900 placeholder-gray-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mr-2 text-xs font-semibold uppercase text-gray-400 hover:text-black"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="group flex items-center justify-center p-2 text-gray-400 transition-colors hover:text-black"
                aria-label="Close search"
              >
                <X className="h-6 w-6 sm:h-8 sm:w-8 transition-transform duration-300 group-hover:rotate-90" />
              </button>
            </form>

            <div className="mt-8 sm:mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {[
                  "Dresses",
                  "Kurtas",
                  "Handbags",
                  "Jewellery",
                  "Tops",
                  "Sale",
                  "Accessories",
                ].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(term.toLowerCase())}`);
                      setSearchOpen(false);
                    }}
                    className="group relative rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-medium text-gray-700 transition hover:border-black hover:text-black"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
