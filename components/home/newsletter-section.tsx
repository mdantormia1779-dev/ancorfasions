"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Jost } from "next/font/google";
import { toast } from "sonner";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export function NewsletterSection() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    if (email) {
      toast.success("You're on the list! 🎉 Check your inbox for a 10% off code.");
      form.reset();
    }
  };

  return (
    <section className={`${jost.className} relative overflow-hidden py-20 md:py-28 bg-[#F8F6F1]`}>
      
      {/* Decorative Background Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-[#C9A86A]/10" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-[#C9A86A]/10" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-[#C9A86A]/10" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          
          {/* Icon */}
          <div className="w-12 h-12 border border-[#C9A86A]/40 flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-5 h-5 text-[#C9A86A]" strokeWidth={1.5} />
          </div>

          {/* Heading */}
          <span className="text-[10px] font-bold tracking-[0.35em] uppercase text-[#C9A86A] mb-4 block">
            Exclusive Access
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight text-[#1A1A1A] mb-4">
            Be The First to Know.
          </h2>
          <p className="text-gray-500 text-sm font-light mb-10 leading-relaxed">
            Subscribe and unlock <strong className="text-[#1A1A1A] font-medium">10% off your first order</strong>. 
            Get early access to new arrivals, exclusive offers, and style inspiration — straight to your inbox.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex w-full max-w-md mx-auto gap-0">
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              className="flex-1 px-5 py-4 bg-white border border-gray-200 border-r-0 text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#C9A86A] transition-colors"
            />
            <button
              type="submit"
              className="bg-[#1A1A1A] hover:bg-[#C9A86A] text-white px-6 py-4 text-xs font-bold tracking-[0.25em] uppercase flex items-center gap-2 transition-colors duration-300 whitespace-nowrap flex-shrink-0"
            >
              Subscribe <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <p className="text-[11px] text-gray-400 font-light mt-4">
            No spam. Unsubscribe anytime. By subscribing you agree to our{" "}
            <a href="/privacy" className="underline hover:text-[#C9A86A] transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
