import { Metadata } from 'next';
import { ProductGallery } from '@/components/product/ProductGallery';
import { Ruler, Truck, ShieldCheck, RefreshCw, Info } from 'lucide-react';
import { CatalogRepository } from '@/repositories/catalog.repository';
import { ProductVariantSelector } from '@/components/product/product-variant-selector';
import { notFound } from 'next/navigation';
import { Jost } from 'next/font/google';

const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500', '600'] });

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const product = await CatalogRepository.getProductBySlug(slug);
  
  if (!product) {
    return {
      title: 'Product Not Found | Anchor Fashion',
    };
  }
  
  return {
    title: `${product.name} | Anchor Fashion`,
    description: product.description || 'Buy premium luxury wear from Anchor Fashion.',
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const product = await CatalogRepository.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const images = product.product_media?.map((m: any) => m.url) || ['/images/placeholder.webp'];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="bg-white min-h-screen pt-4 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Breadcrumb (Minimalist) */}
        <div className="flex items-center text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-8 mt-4">
          <a href="/" className="hover:text-black transition-colors">Home</a>
          <span className="mx-2">/</span>
          <a href="/products" className="hover:text-black transition-colors">Products</a>
          <span className="mx-2">/</span>
          <span className="text-black">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left: Product Gallery */}
          <div className="w-full lg:col-span-7 relative">
            <ProductGallery images={images} />
          </div>

          {/* Right: Sticky Product Details */}
          <div className="flex flex-col lg:col-span-5 sticky top-24">
            
            <div className="mb-6 border-b border-gray-100 pb-6">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C9A86A] mb-2 block">
                {product.brands?.name || 'Anchor Fashion'}
              </span>
              <h1 className={`${jost.className} text-3xl md:text-5xl font-light tracking-tight text-[#1A1A1A] mb-4 leading-[1.1]`}>
                {product.name}
              </h1>
              
              <div className="flex items-end gap-4 mt-2">
                <span className="text-2xl font-medium text-[#1A1A1A]">{formatPrice(product.base_price)}</span>
                {product.compare_at_price && (
                  <span className="text-lg text-gray-400 line-through mb-1">{formatPrice(product.compare_at_price)}</span>
                )}
                {product.stock_quantity > 0 ? (
                  <span className="ml-auto text-xs font-bold tracking-widest uppercase text-green-700 bg-green-50 px-3 py-1.5 border border-green-100">
                    In Stock
                  </span>
                ) : (
                  <span className="ml-auto text-xs font-bold tracking-widest uppercase text-red-700 bg-red-50 px-3 py-1.5 border border-red-100">
                    Sold Out
                  </span>
                )}
              </div>
            </div>

            <div className="mb-8">
              <ProductVariantSelector 
                productId={product.id} 
                baseStockQuantity={product.stock_quantity} 
                variants={product.variants || []} 
              />
            </div>

            {/* Premium Details Accordion (Simulated with simple HTML details/summary for elegance) */}
            <div className="border-t border-gray-100 divide-y divide-gray-100">
              <details className="group" open>
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none py-5 text-sm uppercase tracking-widest">
                  <span>Product Details</span>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <p className="text-gray-500 text-sm leading-relaxed pb-5 animate-fade-in">
                  {product.description || "Crafted from premium materials, this piece embodies modern elegance and comfort. Designed for durability and styled for versatility, it is an essential addition to any curated wardrobe."}
                </p>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none py-5 text-sm uppercase tracking-widest">
                  <span>Shipping & Returns</span>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="pb-5 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Truck className="h-5 w-5 text-[#C9A86A]" strokeWidth={1.5} />
                    <span>Free Standard Delivery over ৳5,000 (Inside Dhaka)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <RefreshCw className="h-5 w-5 text-[#C9A86A]" strokeWidth={1.5} />
                    <span>7-Day Return Policy on unworn items with tags.</span>
                  </div>
                </div>
              </details>
            </div>
            
            {/* Trust Badges */}
            <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between opacity-60">
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-gray-900" strokeWidth={1} />
                <span className="text-[10px] uppercase tracking-widest">Secure Checkout</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Ruler className="h-6 w-6 text-gray-900" strokeWidth={1} />
                <span className="text-[10px] uppercase tracking-widest">Perfect Fit</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Info className="h-6 w-6 text-gray-900" strokeWidth={1} />
                <span className="text-[10px] uppercase tracking-widest">Premium Quality</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
