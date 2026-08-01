import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Instagram } from "lucide-react";

export function SocialFeed() {
  const images = [
    "https://images.unsplash.com/photo-1512413914595-6541f71dfac8?w=500&q=80",
    "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=500&q=80",
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80",
  ];

  return (
    <section className="bg-white py-16">
      <div className="container px-4 md:px-6">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Follow Us @AnchorFashion
            </span>
          </div>
          <Link
            href="/"
            className="group flex items-center text-sm font-medium text-gray-900 transition-colors hover:text-primary"
          >
            View More on Instagram
            <ArrowRight
              className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
              strokeWidth={2.5}
            />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {images.map((src, index) => (
            <Link
              key={index}
              href="/"
              className="group relative aspect-square w-full overflow-hidden rounded-sm bg-gray-100"
            >
              <Image
                src={src}
                alt={`Instagram Post ${index + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/40">
                <Instagram
                  className="h-8 w-8 scale-50 transform text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
                  strokeWidth={1.5}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
