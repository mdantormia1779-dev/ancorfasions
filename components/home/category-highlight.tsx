import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Jost } from "next/font/google";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

const categories = [
  {
    id: 1,
    title: "The Summer Edit",
    subtitle: "Lightweight & Breathable",
    link: "/categories/summer",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    size: "large",
  },
  {
    id: 2,
    title: "Premium Formals",
    subtitle: "Tailored to Perfection",
    link: "/categories/formals",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    size: "small",
  },
  {
    id: 3,
    title: "Lounge & Comfort",
    subtitle: "Everyday Essentials",
    link: "/categories/lounge",
    image:
      "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=800&q=80",
    size: "medium",
  },
  {
    id: 4,
    title: "Accessories",
    subtitle: "The Final Touch",
    link: "/categories/accessories",
    image:
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=800&q=80",
    size: "medium",
  },
];

export function CategoryHighlight() {
  return (
    <section className="border-b border-gray-100 bg-white py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-10 flex flex-col items-end justify-between gap-4 md:flex-row">
          <div className="max-w-xl">
            <h2
              className={`${jost.className} mb-3 text-3xl font-light tracking-tight text-[#1A1A1A] md:text-5xl`}
            >
              Curated Highlights
            </h2>
            <p className="text-sm tracking-wide text-gray-500">
              Explore our most sought-after collections, designed for the modern
              lifestyle.
            </p>
          </div>
          <Link
            href="/categories"
            className="border-b border-black pb-1 text-xs font-bold uppercase tracking-[0.2em] text-black transition-colors hover:border-[#C9A86A] hover:text-[#C9A86A]"
          >
            Shop All Categories
          </Link>
        </div>

        {/* Premium Masonry-Style Staggered Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          {/* Left Column (Large + Small) */}
          <div className="flex flex-col gap-4 md:col-span-7 md:gap-6">
            <Link
              href={categories[0].link}
              className="group relative block h-[400px] w-full overflow-hidden bg-gray-50 md:h-[500px]"
            >
              <Image
                src={categories[0].image}
                alt={categories[0].title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                <div className="text-white">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                    {categories[0].subtitle}
                  </span>
                  <h3 className={`${jost.className} text-3xl font-medium`}>
                    {categories[0].title}
                  </h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:bg-white group-hover:text-black">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <Link
                href={categories[2].link}
                className="group relative block h-[250px] w-full overflow-hidden bg-gray-50 md:h-[300px]"
              >
                <Image
                  src={categories[2].image}
                  alt={categories[2].title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className={`${jost.className} mb-1 text-xl font-medium`}>
                    {categories[2].title}
                  </h3>
                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider transition-colors group-hover:text-[#C9A86A]">
                    Shop Now <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
              <Link
                href={categories[3].link}
                className="group relative block h-[250px] w-full overflow-hidden bg-gray-50 md:h-[300px]"
              >
                <Image
                  src={categories[3].image}
                  alt={categories[3].title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className={`${jost.className} mb-1 text-xl font-medium`}>
                    {categories[3].title}
                  </h3>
                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider transition-colors group-hover:text-[#C9A86A]">
                    Shop Now <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Column (Tall) */}
          <div className="h-[400px] md:col-span-5 md:h-auto">
            <Link
              href={categories[1].link}
              className="group relative block h-full w-full overflow-hidden bg-gray-50"
            >
              <Image
                src={categories[1].image}
                alt={categories[1].title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                <div className="text-white">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                    {categories[1].subtitle}
                  </span>
                  <h3 className={`${jost.className} text-3xl font-medium`}>
                    {categories[1].title}
                  </h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:bg-white group-hover:text-black">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
