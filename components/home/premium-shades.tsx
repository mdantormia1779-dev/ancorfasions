import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Jost } from "next/font/google";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

const collections = [
  {
    id: "women",
    title: "Women's Edit",
    subtitle: "New Season",
    link: "/categories/women",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
    theme: "dark"
  },
  {
    id: "men",
    title: "Men's Style",
    subtitle: "Sharp & Modern",
    link: "/categories/men",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80",
    theme: "light"
  },
  {
    id: "ethnic",
    title: "Ethnic Wear",
    subtitle: "Heritage Collection",
    link: "/categories/ethnic",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
    theme: "dark"
  },
  {
    id: "accessories",
    title: "Accessories",
    subtitle: "Complete the Look",
    link: "/categories/accessories",
    image: "https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=800&q=80",
    theme: "dark"
  }
];

export function PremiumShades() {
  return (
    <section className={`${jost.className} w-full py-16 md:py-24 bg-[#FAFAFA]`}>
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C9A86A] mb-2 block">
              Shop By Category
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight text-[#1A1A1A]">
              Your Style, Your Way.
            </h2>
          </div>
          <Link
            href="/categories"
            className="hidden md:flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-black hover:text-[#C9A86A] transition-colors border-b border-black pb-1 hover:border-[#C9A86A]"
          >
            All Categories
          </Link>
        </div>

        {/* Premium 2x2 Category Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {collections.map((col) => (
            <Link
              key={col.id}
              href={col.link}
              className="group relative h-[250px] md:h-[380px] overflow-hidden bg-[#111] block"
            >
              <Image
                src={col.image}
                alt={col.title}
                fill
                className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-110"
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
              
              {/* Text */}
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <div>
                  <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/60 block mb-1">
                    {col.subtitle}
                  </span>
                  <h3 className="text-white text-lg md:text-2xl font-medium leading-tight">
                    {col.title}
                  </h3>
                </div>
                <div className="w-8 h-8 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white transition-all duration-300 group-hover:bg-[#C9A86A] group-hover:scale-110 flex-shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              {/* Gold accent line on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9A86A] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
