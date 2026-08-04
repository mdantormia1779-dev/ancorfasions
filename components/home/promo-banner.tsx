import Link from "next/link";
import Image from "next/image";
import { Jost } from "next/font/google";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500"] });

interface PromoBannerProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
}

export function PromoBanner({
  title,
  subtitle,
  ctaText,
  ctaLink,
  imageUrl,
}: PromoBannerProps) {
  return (
    <section className="w-full bg-[#FAFAFA] py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="group flex min-h-[500px] flex-col items-stretch overflow-hidden md:min-h-[700px] md:flex-row">
          {/* Left Side: High-Resolution Image */}
          <div className="relative min-h-[400px] w-full overflow-hidden md:min-h-full md:w-1/2">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            />
          </div>

          {/* Right Side: Editorial Content */}
          <div className="relative flex w-full items-center justify-center bg-[#1A1A1A] p-12 md:w-1/2 md:p-20">
            {/* Decorative Gold Frame */}
            <div className="pointer-events-none absolute inset-8 hidden border border-[#C9A86A]/20 md:block" />

            <div className="relative z-10 flex max-w-md flex-col items-center text-center">
              <span className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-[#C9A86A] md:text-sm">
                {subtitle}
              </span>

              <h2
                className={`${jost.className} mb-8 text-4xl font-light leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl`}
              >
                {title}
              </h2>

              <p className="mb-10 max-w-sm text-sm leading-relaxed text-gray-400">
                Elevate your wardrobe with our latest curated collection.
                Exclusive pieces designed for the modern individual who values
                both aesthetics and comfort.
              </p>

              <Link
                href={ctaLink}
                className="group/btn relative inline-flex items-center justify-center overflow-hidden bg-white px-10 py-4 text-xs font-bold uppercase tracking-widest text-[#1A1A1A] transition-all hover:bg-[#C9A86A] hover:text-white"
              >
                <span className="relative z-10 transition-transform group-hover/btn:-translate-y-12">
                  {ctaText}
                </span>
                <span className="absolute inset-0 z-10 flex translate-y-12 items-center justify-center text-white transition-transform group-hover/btn:translate-y-0">
                  {ctaText}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
