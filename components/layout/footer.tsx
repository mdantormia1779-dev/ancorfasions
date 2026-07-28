import Link from "next/link";
import { CreditCard, ShieldCheck, Mail, MapPin, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-[#111111] text-white">
      {/* Newsletter & Trust Bar */}
      <div className="border-b border-zinc-800">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* Newsletter */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight">Unlock 10% Off Your First Order</h3>
              <p className="text-zinc-400 text-sm">Subscribe to receive updates, access to exclusive deals, and more.</p>
              <form className="flex w-full max-w-md items-center space-x-2 mt-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="bg-transparent border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-500 rounded-none h-12"
                />
                <Button type="submit" variant="outline" className="h-12 rounded-none bg-white text-black hover:bg-zinc-200 border-none font-medium uppercase tracking-wider px-6">
                  Subscribe
                </Button>
              </form>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 lg:ml-auto">
              <div className="flex flex-col items-center text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-zinc-400" />
                <span className="text-xs font-medium uppercase tracking-widest text-zinc-300">Authentic<br/>Products</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <CreditCard className="w-8 h-8 text-zinc-400" />
                <span className="text-xs font-medium uppercase tracking-widest text-zinc-300">Secure<br/>Payment</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 col-span-2 sm:col-span-1">
                <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                <span className="text-xs font-medium uppercase tracking-widest text-zinc-300">Easy<br/>Returns</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          {/* Company Info */}
          <div>
            <Link href="/" className="inline-block mb-6">
              <span className="font-extrabold text-2xl tracking-[0.2em] uppercase">Anchor</span>
            </Link>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Elevating the standard of fashion in Bangladesh. Premium quality, timeless designs, and unmatched elegance for the modern lifestyle.
            </p>
            <div className="space-y-3 text-sm text-zinc-400">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" /> <span>Gulshan Avenue, Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" /> <span>+880 9638-000000</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" /> <span>support@anchorfashion.com.bd</span>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-medium mb-6 uppercase tracking-widest text-sm">Shop</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link href="/women" className="hover:text-white transition-colors">Women's Collection</Link></li>
              <li><Link href="/men" className="hover:text-white transition-colors">Men's Collection</Link></li>
              <li><Link href="/kids" className="hover:text-white transition-colors">Kids & Baby</Link></li>
              <li><Link href="/accessories" className="hover:text-white transition-colors">Accessories</Link></li>
              <li><Link href="/new-arrivals" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/sale" className="text-red-400 hover:text-red-300 transition-colors">Special Offers</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-medium mb-6 uppercase tracking-widest text-sm">Customer Care</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link href="/account" className="hover:text-white transition-colors">My Account</Link></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-medium mb-6 uppercase tracking-widest text-sm">Company</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About Anchor</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/stores" className="hover:text-white transition-colors">Store Locator</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Secondary Footer */}
      <div className="border-t border-zinc-800 bg-black">
        <div className="container mx-auto px-4 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-500 tracking-wider">
            © {new Date().getFullYear()} ANCHOR FASHION. ALL RIGHTS RESERVED.
          </p>
          
          {/* Payment Methods (Placeholder Icons) */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 uppercase tracking-widest mr-2">We Accept:</span>
            <div className="h-6 w-10 bg-zinc-800 rounded flex items-center justify-center text-[8px] font-bold text-zinc-400">VISA</div>
            <div className="h-6 w-10 bg-zinc-800 rounded flex items-center justify-center text-[8px] font-bold text-zinc-400">MC</div>
            <div className="h-6 w-10 bg-[#e2136e] rounded flex items-center justify-center text-[9px] font-bold text-white">bKash</div>
            <div className="h-6 w-10 bg-[#f7941d] rounded flex items-center justify-center text-[9px] font-bold text-white">Nagad</div>
          </div>

          {/* Social Media */}
          <div className="flex gap-4">
              <Link href="#" className="bg-white/10 p-2 rounded-full hover:bg-primary hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="bg-white/10 p-2 rounded-full hover:bg-primary hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="bg-white/10 p-2 rounded-full hover:bg-primary hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="bg-white/10 p-2 rounded-full hover:bg-primary hover:text-white transition-colors">
                <span className="sr-only">Youtube</span>
              </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
