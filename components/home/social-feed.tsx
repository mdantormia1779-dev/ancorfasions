import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Instagram } from "lucide-react";

export function SocialFeed() {
  const images = [
    "https://images.unsplash.com/photo-1512413914595-6541f71dfac8?w=500&q=80",
    "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=500&q=80",
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80"
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold tracking-widest text-primary uppercase">
              Follow Us @AnchorFashion
            </span>
          </div>
          <Link 
            href="#" 
            className="group flex items-center text-sm font-medium text-gray-900 hover:text-primary transition-colors"
          >
            View More on Instagram 
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((src, index) => (
            <Link 
              key={index} 
              href="#"
              className="relative w-full aspect-square bg-gray-100 group overflow-hidden rounded-sm"
            >
              <Image
                src={src}
                alt={`Instagram Post ${index + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300" strokeWidth={1.5} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
