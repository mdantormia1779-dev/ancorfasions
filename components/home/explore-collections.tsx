import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Jost } from 'next/font/google';

const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500'] });

interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url?: string;
}

export function ExploreCollections({ categories }: { categories: Category[] }) {
  const displayCategories = categories && categories.length > 0 ? categories : [];
  
  // Premium fashion placeholders if icon_url is missing
  const placeholders = [
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80", // Women's minimal
    "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&q=80", // Men's casual
    "https://images.unsplash.com/photo-1603217192634-61068e4d4bf9?w=800&q=80", // Accessories
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
  ];

  const fallbackCategories: Omit<Category, 'id'>[] = [
    { name: "Women's Collection", slug: "women" },
    { name: "Men's Collection", slug: "men" },
    { name: "Accessories", slug: "accessories" },
    { name: "New Arrivals", slug: "new-arrivals" }
  ];

  const finalCategories: Category[] = [...displayCategories, ...fallbackCategories.map((c, i) => ({ ...c, id: `fallback-${i}` }))].slice(0, 3);

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-16 md:mb-24 gap-4">
          <span className="text-xs font-semibold tracking-[0.3em] text-[#C9A86A] uppercase">
            Curated For You
          </span>
          <h2 className={`${jost.className} text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] leading-tight max-w-2xl font-light tracking-tight`}>
            Elevate Your Everyday Style.
          </h2>
          <Link 
            href="/categories" 
            className="mt-6 group flex items-center text-xs font-bold tracking-[0.2em] uppercase text-[#1A1A1A] hover:text-[#C9A86A] transition-colors pb-1 border-b border-black hover:border-[#C9A86A]"
          >
            Explore All 
            <ArrowRight className="ml-3 w-4 h-4 transition-transform group-hover:translate-x-2" strokeWidth={1.5} />
          </Link>
        </div>

        {/* Premium Balanced Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          
          {finalCategories.map((category, index) => (
            <div key={category.id} className="group flex flex-col">
              <Link 
                href={`/categories/${category.slug}`}
                className="relative w-full aspect-[3/4] overflow-hidden bg-gray-50 mb-6"
              >
                <Image
                  src={category.icon_url || placeholders[index]}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform [transition-duration:10000ms] ease-out group-hover:scale-110"
                />
              </Link>
              <div className="flex flex-col items-center text-center">
                <Link href={`/categories/${category.slug}`}>
                  <h3 className={`${jost.className} text-2xl md:text-3xl text-[#1A1A1A] mb-3 group-hover:text-[#C9A86A] transition-colors font-medium`}>
                    {category.name}
                  </h3>
                </Link>
                <Link 
                  href={`/categories/${category.slug}`}
                  className="text-xs tracking-[0.2em] uppercase text-gray-500 hover:text-black font-medium transition-colors"
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
