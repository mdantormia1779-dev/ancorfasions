import Link from "next/link";
import Image from "next/image";
import { Jost } from 'next/font/google';

const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500'] });

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
        <div className="flex flex-col md:flex-row items-stretch min-h-[500px] md:min-h-[600px] bg-white border border-gray-100 shadow-sm overflow-hidden group">
          
          {/* Left Side: High-Resolution Image */}
          <div className="w-full md:w-1/2 relative min-h-[400px] md:min-h-full overflow-hidden">
            <Image 
              src={imageUrl} 
              alt={title} 
              fill 
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105" 
            />
          </div>

          {/* Right Side: Editorial Content */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-12 md:p-20 relative bg-white">
            {/* Decorative Gold Frame */}
            <div className="absolute inset-8 border border-[#C9A86A]/20 pointer-events-none hidden md:block" />
            
            <div className="flex flex-col items-center text-center max-w-md relative z-10">
              <span className="text-xs md:text-sm font-semibold tracking-[0.3em] text-[#C9A86A] uppercase mb-6">
                {subtitle}
              </span>
              
              <h2 className={`${jost.className} text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] leading-[1.1] mb-8 font-light tracking-tight`}>
                {title}
              </h2>
              
              <p className="text-gray-500 mb-10 text-sm leading-relaxed max-w-sm">
                Elevate your wardrobe with our latest curated collection. Exclusive pieces designed for the modern individual who values both aesthetics and comfort.
              </p>
              
              <Link 
                href={ctaLink}
                className="group/btn relative inline-flex items-center justify-center px-10 py-4 text-xs font-bold uppercase tracking-widest text-white bg-[#1A1A1A] overflow-hidden transition-all hover:bg-black"
              >
                <span className="relative z-10 transition-transform group-hover/btn:-translate-y-12">
                  {ctaText}
                </span>
                <span className="absolute inset-0 z-10 flex items-center justify-center text-[#C9A86A] transition-transform translate-y-12 group-hover/btn:translate-y-0">
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
