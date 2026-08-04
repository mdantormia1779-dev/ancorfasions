import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Jost } from "next/font/google";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500"] });

interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url?: string;
}

export function ExploreCollections({ categories }: { categories: Category[] }) {
  const displayCategories =
    categories && categories.length > 0 ? categories : [];

  // Premium fashion placeholders if icon_url is missing
  const placeholders = [
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80", // Women's minimal
    "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&q=80", // Men's casual
    "https://images.unsplash.com/photo-1603217192634-61068e4d4bf9?w=800&q=80", // Accessories
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
  ];

  const fallbackCategories: Omit<Category, "id">[] = [
    { name: "Women's Collection", slug: "women" },
    { name: "Men's Collection", slug: "men" },
    { name: "Accessories", slug: "accessories" },
    { name: "New Arrivals", slug: "new-arrivals" },
  ];

  const finalCategories: Category[] = [
    ...displayCategories,
    ...fallbackCategories.map((c, i) => ({ ...c, id: `fallback-${i}` })),
  ].slice(0, 3);

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mb-16 flex flex-col items-center gap-4 text-center md:mb-24">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C9A86A]">
            Curated For You
          </span>
          <h2
            className={`${jost.className} max-w-2xl text-4xl font-light leading-tight tracking-tight text-[#1A1A1A] md:text-5xl lg:text-6xl`}
          >
            Elevate Your Everyday Style.
          </h2>
          <Link
            href="/categories"
            className="group mt-6 flex items-center border-b border-black pb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] transition-colors hover:border-[#C9A86A] hover:text-[#C9A86A]"
          >
            Explore All
            <ArrowRight
              className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-2"
              strokeWidth={1.5}
            />
          </Link>
        </div>

        {/* Premium Balanced Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
          {finalCategories.map((category, index) => (
            <div key={category.id} className="group flex flex-col">
              <Link
                href={`/categories/${category.slug}`}
                className="relative mb-6 aspect-[3/4] w-full overflow-hidden bg-gray-50 after:absolute after:inset-0 after:bg-black/0 after:transition-colors after:duration-500 group-hover:after:bg-black/10"
              >
                <Image
                  src={category.icon_url || placeholders[index]}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                  className="object-cover transition-transform ease-out [transition-duration:10000ms] group-hover:scale-105"
                />
              </Link>
              <div className="flex flex-col items-center text-center">
                <Link href={`/categories/${category.slug}`}>
                  <h3
                    className={`${jost.className} mb-3 text-2xl font-medium text-[#1A1A1A] transition-colors group-hover:text-[#C9A86A] md:text-3xl`}
                  >
                    {category.name}
                  </h3>
                </Link>
                <Link
                  href={`/categories/${category.slug}`}
                  className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-black"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
