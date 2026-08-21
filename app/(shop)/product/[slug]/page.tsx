import { Metadata } from "next";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Ruler, Truck, ShieldCheck, RefreshCw, Info } from "lucide-react";
import { CatalogRepository } from "@/repositories/catalog.repository";
import { ProductVariantSelector } from "@/components/product/product-variant-selector";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductCard } from "@/components/product/product-card";
import { FloatingPurchaseCard } from "@/components/product/floating-purchase-card";
import { ProductViewTracker } from "@/components/product/product-view-tracker";
import { notFound } from "next/navigation";
import { Jost } from "next/font/google";
import { formatCurrency } from "@/lib/utils";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await CatalogRepository.getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Anchor Fashion",
    };
  }

  return {
    title: `${product.name} | Anchor Fashion`,
    description:
      product.description || "Buy premium luxury wear from Anchor Fashion.",
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await CatalogRepository.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const images = product.product_media?.map((m: any) => m.url) || [
    "/images/placeholder.webp",
  ];

  let relatedProducts: any[] = [];
  if (product.categories?.slug) {
    const { data } = await CatalogRepository.getProducts({
      category: product.categories.slug,
      limit: 5,
    });
    // Exclude current product
    relatedProducts = data.filter((p: any) => p.id !== product.id);
  }

  const formatPrice = (price: number) => formatCurrency(price);

  // is_in_stock is computed in the repository from real inventory_levels data
  const isInStock = (product as any).is_in_stock ?? false;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images[0],
    description:
      product.description || "Buy premium luxury wear from Anchor Fashion.",
    brand: {
      "@type": "Brand",
      name: (product as any).brands?.name || "Anchor Fashion",
    },
    offers: {
      "@type": "Offer",
      url: `https://anchorfashion.com/product/${product.slug}`,
      priceCurrency: "BDT",
      price: product.base_price,
      itemCondition: "https://schema.org/NewCondition",
      availability: isInStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="min-h-screen bg-white pb-20 pt-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductViewTracker product={product} />
      <FloatingPurchaseCard
        productId={product.id}
        productName={product.name}
        productPrice={product.base_price}
        productImage={images[0]}
        variants={(product as any).variants}
      />

      <div className="container mx-auto px-4 py-8 md:px-6 md:py-16">
        {/* Breadcrumb (Minimalist) */}
        <div className="mb-12 flex items-center text-[10px] uppercase tracking-[0.2em] text-gray-400">
          <a href="/" className="transition-colors hover:text-black">
            Home
          </a>
          <span className="mx-2">/</span>
          <a href="/products" className="transition-colors hover:text-black">
            Products
          </a>
          <span className="mx-2">/</span>
          <span className="text-black">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-20">
          {/* Left: Product Gallery */}
          <div className="relative w-full lg:col-span-7">
            <ProductGallery images={images} />
          </div>

          {/* Right: Sticky Product Details */}
          <div className="sticky top-24 flex flex-col lg:col-span-5">
            <div className="mb-8 border-b border-gray-100 pb-8">
              <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
                {(product as any).brands?.name || "Anchor Fashion"}
              </span>
              <h1
                className={`${jost.className} mb-6 text-4xl font-light leading-[1.1] tracking-tight text-[#1A1A1A] md:text-5xl lg:text-6xl`}
              >
                {product.name}
              </h1>

              <div className="mt-4 flex items-end gap-5">
                <span className="text-3xl font-medium text-[#1A1A1A]">
                  {formatPrice(product.base_price)}
                </span>
                {(product as any).compare_at_price && (
                  <span className="mb-1 text-xl text-gray-400 line-through">
                    {formatPrice((product as any).compare_at_price)}
                  </span>
                )}
                {isInStock ? (
                  <span className="ml-auto border border-[#1A1A1A] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">
                    In Stock
                  </span>
                ) : (
                  <span className="ml-auto border border-gray-300 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Sold Out
                  </span>
                )}
              </div>
            </div>

            <div className="mb-10">
              <ProductVariantSelector
                productId={product.id}
                baseStockQuantity={(product as any).total_available_stock ?? 0}
                variants={(product as any).variants || []}
                productName={product.name}
                productPrice={product.base_price}
                productImage={images[0]}
              />
            </div>

            {/* Premium Details Accordion */}
            <div className="divide-y divide-gray-100 border-t border-gray-100">
              <details className="group" open>
                <summary className="flex cursor-pointer list-none items-center justify-between py-6 text-xs font-semibold uppercase tracking-widest text-[#1A1A1A]">
                  <span>Description</span>
                  <span className="transition-transform duration-300 group-open:rotate-180">
                    <svg
                      fill="none"
                      height="20"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="20"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <p className="animate-fade-in pb-6 text-sm leading-relaxed text-gray-500">
                  {product.description ||
                    "Crafted from premium materials, this piece embodies modern elegance and comfort. Designed for durability and styled for versatility, it is an essential addition to any curated wardrobe."}
                </p>
              </details>

              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between py-6 text-xs font-semibold uppercase tracking-widest text-[#1A1A1A]">
                  <span>Shipping &amp; Returns</span>
                  <span className="transition-transform duration-300 group-open:rotate-180">
                    <svg
                      fill="none"
                      height="20"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="20"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <div className="animate-fade-in space-y-4 pb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Truck className="h-4 w-4 text-[#1A1A1A]" strokeWidth={1.5} />
                    <span>Free Standard Delivery over ৳3,000 (Inside Dhaka)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <RefreshCw className="h-4 w-4 text-[#1A1A1A]" strokeWidth={1.5} />
                    <span>7-Day Easy Return Policy on unworn items.</span>
                  </div>
                </div>
              </details>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-2 gap-4 border-t border-gray-100 pt-8 sm:grid-cols-4">
              <div className="flex flex-col items-center text-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#1A1A1A]" strokeWidth={1.5} />
                <span className="text-[9px] uppercase tracking-widest text-gray-500">
                  Secure Checkout
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <Ruler className="h-5 w-5 text-[#1A1A1A]" strokeWidth={1.5} />
                <span className="text-[9px] uppercase tracking-widest text-gray-500">
                  Perfect Fit
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <Info className="h-5 w-5 text-[#1A1A1A]" strokeWidth={1.5} />
                <span className="text-[9px] uppercase tracking-widest text-gray-500">
                  Premium Quality
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <RefreshCw className="h-5 w-5 text-[#1A1A1A]" strokeWidth={1.5} />
                <span className="text-[9px] uppercase tracking-widest text-gray-500">
                  Easy Returns
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section — only render when there is real review data */}
      {(product as any).total_reviews > 0 && (
        <ProductReviews
          productId={product.id}
          averageRating={(product as any).average_rating}
          totalReviews={(product as any).total_reviews}
        />
      )}

      {/* Related Products / You May Also Like */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="border-t border-gray-100 py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <h2
              className={`${jost.className} mb-12 text-center text-2xl font-light tracking-tight text-[#1A1A1A] md:text-3xl`}
            >
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-4 md:gap-x-8">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
