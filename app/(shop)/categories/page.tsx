import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Categories | Anchor Fashion",
  description: "Explore all fashion categories.",
};

export default function CategoriesPage() {
  const categories = [
    {
      id: "1",
      name: "Men",
      slug: "men",
      count: 120,
      image: "https://placehold.co/600x400/111/fff?text=Men",
    },
    {
      id: "2",
      name: "Women",
      slug: "women",
      count: 145,
      image: "https://placehold.co/600x400/333/fff?text=Women",
    },
    {
      id: "3",
      name: "Kids",
      slug: "kids",
      count: 85,
      image: "https://placehold.co/600x400/555/fff?text=Kids",
    },
    {
      id: "4",
      name: "Accessories",
      slug: "accessories",
      count: 210,
      image: "https://placehold.co/600x400/777/fff?text=Accessories",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-center text-4xl font-bold tracking-tight">
        Shop by Category
      </h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            href={`/categories/${category.slug}`}
            key={category.id}
            className="group relative block overflow-hidden rounded-lg"
          >
            <div className="aspect-[4/5]">
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-bold uppercase tracking-widest">
                  {category.name}
                </h2>
                <p className="mt-2 text-sm opacity-90">
                  {category.count} Products
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
