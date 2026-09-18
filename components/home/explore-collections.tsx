import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Jost } from "next/font/google";
import { Collection } from "@/types/catalog.types";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

interface ExploreCollectionsProps {
  collections?: Collection[];
  categories?: any[];
}

export function ExploreCollections({
  collections = [],
}: ExploreCollectionsProps) {
  const activeCollections = (collections || []).filter((c) => c.is_active);

  // Fallback fashion placeholders if no collections exist yet
  const placeholders = [
    "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&q=80", // Men's
    "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&q=80", // Women's
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80", // Kids
    "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=800&q=80", // Accessories
  ];

  const fallbackItems = [
    {
      id: "fb-1",
      name: "Men's Edit",
      slug: "mens",
      banner_url: placeholders[0],
      isFallback: true,
    },
    {
      id: "fb-2",
      name: "Women's Luxe",
      slug: "womens",
      banner_url: placeholders[1],
      isFallback: true,
    },
    {
      id: "fb-3",
      name: "Junior Styles",
      slug: "kids",
      banner_url: placeholders[2],
      isFallback: true,
    },
    {
      id: "fb-4",
      name: "Statement Pieces",
      slug: "accessories",
      banner_url: placeholders[3],
      isFallback: true,
    },
  ];

  const displayItems =
    activeCollections.length > 0 ? activeCollections : fallbackItems;

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mb-14 flex flex-col items-center gap-3 text-center md:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#C9A86A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A86A]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Curated For You</span>
          </div>
          <h2
            className={`${jost.className} max-w-2xl text-4xl font-light leading-tight tracking-tight text-[#1A1A1A] md:text-5xl lg:text-6xl`}
          >
            Explore Collections.
          </h2>
          <p className="max-w-md text-sm font-light text-gray-500">
            Discover seasonal wardrobes, handpicked capsule lines, and trendsetting style edits.
          </p>
          <Link
            href="/collections"
            className="group mt-3 flex items-center border-b border-black pb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] transition-colors hover:border-[#C9A86A] hover:text-[#C9A86A]"
          >
            View All Collections
            <ArrowRight
              className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-2"
              strokeWidth={1.5}
            />
          </Link>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-8">
          {displayItems.map((item: any, index: number) => {
            const linkHref = item.isFallback
              ? `/categories/${item.slug}`
              : `/collections/${item.slug}`;
            const imageSrc =
              item.banner_url || placeholders[index % placeholders.length];

            return (
              <div key={item.id} className="group relative flex flex-col">
                <Link
                  href={linkHref}
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 shadow-xs transition-all duration-500 group-hover:shadow-xl"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/85" />

                  {/* Top Product Count Badge */}
                  {item.product_count !== undefined && item.product_count > 0 && (
                    <div className="absolute top-3 left-3">
                      <span className="rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-semibold tracking-wider text-black uppercase shadow-xs">
                        {item.product_count}{" "}
                        {item.product_count === 1 ? "Item" : "Items"}
                      </span>
                    </div>
                  )}

                  {/* Bottom Content inside Card */}
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white flex flex-col justify-end">
                    <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#EAD098] mb-1">
                      Collection
                    </span>
                    <h3
                      className={`${jost.className} text-2xl font-medium tracking-tight text-white mb-2 transition-transform duration-300 group-hover:translate-x-1`}
                    >
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/90 group-hover:text-[#EAD098] transition-colors">
                      <span>Shop Now</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
