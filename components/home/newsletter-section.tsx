"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Jost } from "next/font/google";
import { toast } from "sonner";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export function NewsletterSection() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    if (email) {
      toast.success(
        "You're on the list! 🎉 Check your inbox for a 10% off code."
      );
      form.reset();
    }
  };

  return (
    <section
      className={`${jost.className} relative overflow-hidden bg-[#F8F6F1] py-20 md:py-28`}
    >
      {/* Decorative Background Lines */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-full w-px bg-[#C9A86A]/10" />
        <div className="absolute right-1/4 top-0 h-full w-px bg-[#C9A86A]/10" />
        <div className="absolute left-0 right-0 top-1/2 h-px bg-[#C9A86A]/10" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          {/* Icon */}
          <div className="mx-auto mb-8 flex h-12 w-12 items-center justify-center border border-[#C9A86A]/40">
            <Sparkles className="h-5 w-5 text-[#C9A86A]" strokeWidth={1.5} />
          </div>

          {/* Heading */}
          <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.35em] text-[#C9A86A]">
            Exclusive Access
          </span>
          <h2 className="mb-4 text-3xl font-light tracking-tight text-[#1A1A1A] md:text-5xl">
            Be The First to Know.
          </h2>
          <p className="mb-10 text-sm font-light leading-relaxed text-gray-500">
            Subscribe and unlock{" "}
            <strong className="font-medium text-[#1A1A1A]">
              10% off your first order
            </strong>
            . Get early access to new arrivals, exclusive offers, and style
            inspiration — straight to your inbox.
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex w-full max-w-md gap-0"
          >
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              className="flex-1 border border-r-0 border-gray-200 bg-white px-5 py-4 text-sm text-[#1A1A1A] transition-colors placeholder:text-gray-400 focus:border-[#C9A86A] focus:outline-none"
            />
            <button
              type="submit"
              className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap bg-[#1A1A1A] px-6 py-4 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:bg-[#C9A86A]"
            >
              Subscribe <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          <p className="mt-4 text-[11px] font-light text-gray-400">
            No spam. Unsubscribe anytime. By subscribing you agree to our{" "}
            <a
              href="/privacy"
              className="underline transition-colors hover:text-[#C9A86A]"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
