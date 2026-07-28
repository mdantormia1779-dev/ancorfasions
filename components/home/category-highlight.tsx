import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Jost } from 'next/font/google';

const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500', '600'] });

const categories = [
  {
    id: 1,
    title: "The Summer Edit",
    subtitle: "Lightweight & Breathable",
    link: "/categories/summer",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    size: "large"
  },
  {
    id: 2,
    title: "Premium Formals",
    subtitle: "Tailored to Perfection",
    link: "/categories/formals",
    image: "https://images.unsplash.com/photo-1594938298598-70f90fe271bc?w=800&q=80",
    size: "small"
  },
  {
    id: 3,
    title: "Lounge & Comfort",
    subtitle: "Everyday Essentials",
    link: "/categories/lounge",
    image: "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=800&q=80",
    size: "medium"
  },
  {
    id: 4,
    title: "Accessories",
    subtitle: "The Final Touch",
    link: "/categories/accessories",
    image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=800&q=80",
    size: "medium"
  }
];

export function CategoryHighlight() {
  return (
    <section className="bg-white py-12 md:py-20 border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div className="max-w-xl">
            <h2 className={`${jost.className} text-3xl md:text-5xl text-[#1A1A1A] mb-3 font-light tracking-tight`}>
              Curated Highlights
            </h2>
            <p className="text-gray-500 text-sm tracking-wide">
              Explore our most sought-after collections, designed for the modern lifestyle.
            </p>
          </div>
          <Link 
            href="/categories" 
            className="text-xs font-bold tracking-[0.2em] uppercase text-black hover:text-[#C9A86A] transition-colors border-b border-black pb-1 hover:border-[#C9A86A]"
          >
            Shop All Categories
          </Link>
        </div>

        {/* Premium Masonry-Style Staggered Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          
          {/* Left Column (Large + Small) */}
          <div className="md:col-span-7 flex flex-col gap-4 md:gap-6">
            <Link href={categories[0].link} className="group relative w-full h-[400px] md:h-[500px] bg-gray-50 overflow-hidden block">
              <Image src={categories[0].image} alt={categories[0].title} fill className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                <div className="text-white">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/80 mb-2 block">{categories[0].subtitle}</span>
                  <h3 className={`${jost.className} text-3xl font-medium`}>{categories[0].title}</h3>
                </div>
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:bg-white group-hover:text-black">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <Link href={categories[2].link} className="group relative w-full h-[250px] md:h-[300px] bg-gray-50 overflow-hidden block">
                <Image src={categories[2].image} alt={categories[2].title} fill className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className={`${jost.className} text-xl font-medium mb-1`}>{categories[2].title}</h3>
                  <span className="text-[10px] uppercase tracking-wider group-hover:text-[#C9A86A] transition-colors flex items-center gap-1">Shop Now <ArrowUpRight className="w-3 h-3" /></span>
                </div>
              </Link>
              <Link href={categories[3].link} className="group relative w-full h-[250px] md:h-[300px] bg-gray-50 overflow-hidden block">
                <Image src={categories[3].image} alt={categories[3].title} fill className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className={`${jost.className} text-xl font-medium mb-1`}>{categories[3].title}</h3>
                  <span className="text-[10px] uppercase tracking-wider group-hover:text-[#C9A86A] transition-colors flex items-center gap-1">Shop Now <ArrowUpRight className="w-3 h-3" /></span>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Column (Tall) */}
          <div className="md:col-span-5 h-[400px] md:h-auto">
            <Link href={categories[1].link} className="group relative w-full h-full bg-gray-50 overflow-hidden block">
              <Image src={categories[1].image} alt={categories[1].title} fill className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                <div className="text-white">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/80 mb-2 block">{categories[1].subtitle}</span>
                  <h3 className={`${jost.className} text-3xl font-medium`}>{categories[1].title}</h3>
                </div>
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:bg-white group-hover:text-black">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
