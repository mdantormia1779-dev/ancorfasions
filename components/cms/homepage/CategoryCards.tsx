import React from 'react';
import Link from 'next/link';

interface CategoryCardsProps {
  // This would receive data from homepage_featured_categories
  categories?: any[];
}

export function CategoryCards({ categories = [] }: CategoryCardsProps) {
  const displayCategories = categories.length > 0 ? categories : [
    { id: '1', name: 'Women', url: '/women', image: 'https://placehold.co/600x800/eaeaea/black?text=Women' },
    { id: '2', name: 'Men', url: '/men', image: 'https://placehold.co/600x800/eaeaea/black?text=Men' },
    { id: '3', name: 'Kids', url: '/kids', image: 'https://placehold.co/600x800/eaeaea/black?text=Kids' },
  ];

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayCategories.map((category) => (
          <Link key={category.id} href={category.url} className="group relative block w-full aspect-[3/4] overflow-hidden bg-gray-100">
            <img 
              src={category.image} 
              alt={category.name} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            
            <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col items-center">
              <h3 className="text-white text-3xl font-bold uppercase tracking-widest mb-4 transform transition-transform duration-500 group-hover:-translate-y-2">
                {category.name}
              </h3>
              <span className="inline-block border-b-2 border-white pb-1 text-white text-sm font-medium tracking-widest uppercase opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                Discover
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
