import Link from "next/link";
import Image from "next/image";

interface Category {
  id: string;
  label: string;
  icon?: string;
  active?: boolean;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "all", label: "All", icon: "👚", active: true },
  { id: "dresses", label: "Dresses", icon: "👗" },
  { id: "tshirts", label: "T-shirts", icon: "👕" },
  { id: "denim", label: "Denim", icon: "👖" },
  { id: "jackets", label: "Jackets", icon: "🧥" },
  { id: "coats", label: "Coats", icon: "🥼" },
  { id: "shoes", label: "Shoes", icon: "👟" },
];

export function CategoryIcons({ categories = DEFAULT_CATEGORIES }: { categories?: Category[] }) {

  return (
    <section className="w-full py-10 bg-white">
      <div className="container px-4 text-center">
        <h2 className="text-3xl font-bold text-[#fa5a5a] mb-2">Category</h2>
        <div className="flex items-center justify-center gap-1 mb-12">
          <div className="w-2 h-2 rounded-full bg-[#fa5a5a]"></div>
          <div className="w-12 h-[2px] bg-[#fa5a5a]"></div>
          <div className="w-2 h-2 rounded-full bg-[#fa5a5a]"></div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/categories/${cat.id}`}
              className="flex flex-col items-center gap-4 group"
            >
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-3xl md:text-4xl bg-white border-2 transition-all ${cat.active ? 'border-[#fa5a5a] shadow-md shadow-[#fa5a5a]/20' : 'border-transparent group-hover:border-[#fa5a5a]/30'}`}>
                {cat.icon}
              </div>
              <span className={`font-medium text-sm md:text-base ${cat.active ? 'text-black border-b-2 border-black pb-1' : 'text-[#fa5a5a]'}`}>
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
