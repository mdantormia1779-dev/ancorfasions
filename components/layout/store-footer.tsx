import Link from "next/link";
import { AnchorFashionLogo } from "@/components/shared/logo";
import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { getStoreInfo, getSocialLinks } from "@/lib/actions/settings.actions";
import { Jost } from "next/font/google";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

const footerLinks = {
  shop: [
    { label: "New Arrivals", href: "/products?sort=newest" },
    { label: "Men's Collection", href: "/categories/men" },
    { label: "Women's Collection", href: "/categories/women" },
    { label: "Accessories", href: "/categories/accessories" },
    { label: "Sale & Clearance", href: "/collections/sale" },
    { label: "All Products", href: "/products" },
  ],
  help: [
    { label: "Size Guide", href: "/support/size-guide" },
    { label: "Shipping & Returns", href: "/support/shipping" },
    { label: "Track My Order", href: "/support/track-order" },
    { label: "FAQ", href: "/support/faq" },
    { label: "Contact Us", href: "/contact" },
  ],
  legal: [
    { label: "About Us", href: "/about" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const paymentMethods = [
  "Bkash",
  "Nagad",
  "Rocket",
  "Visa",
  "MasterCard",
  "SSLCOMMERZ",
];

export async function StoreFooter() {
  const [storeInfo, socialLinks] = await Promise.all([
    getStoreInfo(),
    getSocialLinks(),
  ]);

  return (
    <footer className={`${jost.className} bg-[#0D1B2A] text-white`}>
      {/* Top Section: Newsletter Banner */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-14">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <span className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C9A86A]">
                Stay Ahead of the Curve
              </span>
              <h3 className="text-3xl font-light tracking-tight md:text-4xl">
                Exclusive Offers, <span className="text-[#C9A86A]">First.</span>
              </h3>
              <p className="mt-2 text-sm font-light text-white/50">
                Join thousands of style-savvy shoppers and get new drops before
                everyone else.
              </p>
            </div>
            <form className="flex w-full min-w-[360px] gap-0 md:w-auto">
              <input
                type="email"
                placeholder="Your email address..."
                required
                className="flex-1 border border-white/15 bg-white/5 px-4 py-3 text-sm text-white transition-colors placeholder:text-white/40 focus:border-[#C9A86A] focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-2 whitespace-nowrap bg-[#C9A86A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b8973e]"
              >
                Subscribe <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Links Section */}
      <div className="container mx-auto px-4 py-14 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {/* Brand Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Logo on dark background */}
            <div className="w-48 opacity-90 brightness-0 invert filter">
              <AnchorFashionLogo />
            </div>
            <p className="max-w-xs text-sm font-light leading-relaxed text-white/50">
              {storeInfo.store_description ||
                "Crafting premium fashion experiences for the modern, style-conscious individual."}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              {[
                {
                  icon: Facebook,
                  href: socialLinks?.facebook || "#",
                  label: "Facebook",
                },
                {
                  icon: Instagram,
                  href: socialLinks?.instagram || "#",
                  label: "Instagram",
                },
                {
                  icon: Youtube,
                  href: socialLinks?.youtube || "#",
                  label: "YouTube",
                },
              ].map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/50 transition-all duration-300 hover:border-[#C9A86A] hover:text-[#C9A86A]"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
            {/* Contact */}
            <div className="space-y-2.5 pt-1">
              {storeInfo.phone && (
                <div className="flex items-center gap-2.5 text-sm text-white/50">
                  <Phone
                    className="h-4 w-4 flex-shrink-0 text-[#C9A86A]"
                    strokeWidth={1.5}
                  />
                  <span>{storeInfo.phone}</span>
                </div>
              )}
              {storeInfo.email && (
                <div className="flex items-center gap-2.5 text-sm text-white/50">
                  <Mail
                    className="h-4 w-4 flex-shrink-0 text-[#C9A86A]"
                    strokeWidth={1.5}
                  />
                  <span>{storeInfo.email}</span>
                </div>
              )}
              {storeInfo.address && (
                <div className="flex items-start gap-2.5 text-sm text-white/50">
                  <MapPin
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C9A86A]"
                    strokeWidth={1.5}
                  />
                  <span>{storeInfo.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shop Column */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A86A]">
              Shop
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Column */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A86A]">
              Help
            </h4>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-[#C9A86A]">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row md:px-6">
          <p className="text-xs font-light tracking-wide text-white/30">
            © {new Date().getFullYear()}{" "}
            {storeInfo.store_name || "Anchor Fashion"}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="mr-1 text-[10px] uppercase tracking-widest text-white/25">
              We accept
            </span>
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="border border-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/40"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
