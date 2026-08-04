import { ProductCard } from "@/components/product/product-card";
import { Jost } from "next/font/google";
import { cn } from "@/lib/utils";

const jost = Jost({ subsets: ["latin"] });

interface PersonalizedSectionProps {
  title: string;
  subtitle?: string;
  products: any[];
  className?: string;
}

export function PersonalizedSection({ title, subtitle, products, className }: PersonalizedSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className={cn("py-20", className)}>
      <div className="container px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className={`${jost.className} text-3xl font-light tracking-tight text-[#1A1A1A]`}>
            {title}
          </h2>
          {subtitle && <p className="mt-2 text-sm text-gray-500 uppercase tracking-widest">{subtitle}</p>}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-4 md:gap-x-8">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
