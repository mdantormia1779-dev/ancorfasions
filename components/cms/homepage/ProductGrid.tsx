import React from 'react';
import Link from 'next/link';

interface ProductGridProps {
  title: string;
  // This would typically receive an array of rich product objects from the CMS
  // For the blueprint foundation, we type it loosely or use placeholder data
  products?: any[];
}

export function ProductGrid({ title, products = [] }: ProductGridProps) {
  // Fallback placeholder data if none provided
  const displayProducts = products.length > 0 ? products : [
    { id: '1', name: 'Premium Oxford Shirt', price: '৳3,500', image: 'https://placehold.co/400x500/eaeaea/black?text=Product+1' },
    { id: '2', name: 'Slim Fit Chinos', price: '৳2,800', image: 'https://placehold.co/400x500/eaeaea/black?text=Product+2' },
    { id: '3', name: 'Classic Leather Belt', price: '৳1,500', image: 'https://placehold.co/400x500/eaeaea/black?text=Product+3' },
    { id: '4', name: 'Silk Blend Tie', price: '৳1,200', image: 'https://placehold.co/400x500/eaeaea/black?text=Product+4' },
  ];

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end mb-10 border-b border-gray-200 pb-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-black uppercase">
          {title}
        </h2>
        <Link href="/products" className="text-sm font-medium hover:underline hidden sm:block">
          View All Products
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
        {displayProducts.map((product) => (
          <div key={product.id} className="group relative flex flex-col">
            <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="object-cover object-center w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
              {/* Quick Add overlay */}
              <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/50 to-transparent flex justify-center">
                <button className="w-full bg-white text-black text-sm font-medium py-3 uppercase tracking-wider hover:bg-gray-100 shadow-sm">
                  Quick Add
                </button>
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <h3 className="text-sm text-gray-700 font-medium truncate uppercase tracking-wide">
                <Link href={`/product/${product.id}`}>
                  <span aria-hidden="true" className="absolute inset-0 z-10 opacity-0 cursor-pointer" />
                  {product.name}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-black font-semibold">{product.price}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center sm:hidden">
        <Link href="/products" className="inline-block border border-black px-8 py-3 text-sm font-medium uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
          Explore Collection
        </Link>
      </div>
    </section>
  );
}
