import Link from "next/link";
import { AnchorFashionLogo } from "@/components/shared/logo";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
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

const paymentMethods = ["Bkash", "Nagad", "Rocket", "Visa", "MasterCard", "SSLCOMMERZ"];

export async function StoreFooter() {
  const [storeInfo, socialLinks] = await Promise.all([getStoreInfo(), getSocialLinks()]);

  return (
    <footer className={`${jost.className} bg-[#0D1B2A] text-white`}>
      
      {/* Top Section: Newsletter Banner */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C9A86A] mb-3 block">
                Stay Ahead of the Curve
              </span>
              <h3 className="text-3xl md:text-4xl font-light tracking-tight">
                Exclusive Offers, <span className="text-[#C9A86A]">First.</span>
              </h3>
              <p className="text-white/50 text-sm mt-2 font-light">
                Join thousands of style-savvy shoppers and get new drops before everyone else.
              </p>
            </div>
            <form className="flex w-full md:w-auto min-w-[360px] gap-0">
              <input
                type="email"
                placeholder="Your email address..."
                required
                className="flex-1 bg-white/5 border border-white/15 text-white placeholder:text-white/40 text-sm px-4 py-3 focus:outline-none focus:border-[#C9A86A] transition-colors"
              />
              <button
                type="submit"
                className="bg-[#C9A86A] hover:bg-[#b8973e] text-white px-5 py-3 text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Links Section */}
      <div className="container mx-auto px-4 md:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-6">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logo on dark background */}
            <div className="filter invert brightness-0 invert w-48 opacity-90">
              <AnchorFashionLogo />
            </div>
            <p className="text-white/50 text-sm leading-relaxed font-light max-w-xs">
              {storeInfo.store_description || "Crafting premium fashion experiences for the modern, style-conscious individual."}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              {[
                { icon: Facebook, href: socialLinks?.facebook || "#", label: "Facebook" },
                { icon: Instagram, href: socialLinks?.instagram || "#", label: "Instagram" },
                { icon: Youtube, href: socialLinks?.youtube || "#", label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 border border-white/15 flex items-center justify-center text-white/50 hover:text-[#C9A86A] hover:border-[#C9A86A] transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
            {/* Contact */}
            <div className="space-y-2.5 pt-1">
              {storeInfo.phone && (
                <div className="flex items-center gap-2.5 text-white/50 text-sm">
                  <Phone className="w-4 h-4 text-[#C9A86A] flex-shrink-0" strokeWidth={1.5} />
                  <span>{storeInfo.phone}</span>
                </div>
              )}
              {storeInfo.email && (
                <div className="flex items-center gap-2.5 text-white/50 text-sm">
                  <Mail className="w-4 h-4 text-[#C9A86A] flex-shrink-0" strokeWidth={1.5} />
                  <span>{storeInfo.email}</span>
                </div>
              )}
              {storeInfo.address && (
                <div className="flex items-start gap-2.5 text-white/50 text-sm">
                  <MapPin className="w-4 h-4 text-[#C9A86A] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>{storeInfo.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shop Column */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-[#C9A86A]">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Column */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-[#C9A86A]">Help</h4>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-[#C9A86A]">Company</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors font-light"
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
        <div className="container mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30 font-light tracking-wide">
            © {new Date().getFullYear()} {storeInfo.store_name || "Anchor Fashion"}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-white/25 uppercase tracking-widest mr-1">We accept</span>
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="px-2 py-0.5 border border-white/15 text-[9px] font-bold tracking-wide text-white/40 uppercase"
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
