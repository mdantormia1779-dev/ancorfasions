import { notFound } from "next/navigation";
import Link from "next/link";
import { CatalogRepository } from "@/repositories/catalog.repository";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, Share2, Ruler, Shield, Truck, Package } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await CatalogRepository.getProductBySlug(resolvedParams.slug);
  if (!product) return { title: 'Product Not Found' };
  
  return {
    title: product.seo_title || product.name,
    description: product.seo_description || product.description?.substring(0, 160) || `Buy ${product.name} at Anchor Fashion.`,
    openGraph: {
      title: product.seo_title || product.name,
      description: product.seo_description || product.description?.substring(0, 160),
      images: product.product_media?.[0]?.url ? [product.product_media[0].url] : [],
    }
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const product = await CatalogRepository.getProductBySlug(resolvedParams.slug);
  
  if (!product) {
    notFound();
  }

  const { data: relatedProducts } = await CatalogRepository.getProducts({ 
    category: product.categories?.slug, 
    limit: 5 
  });
  
  // Exclude current product from related
  const filteredRelated = relatedProducts.filter((p: any) => p.id !== product.id).slice(0, 4);

  const productImages = product.product_media?.sort((a: any, b: any) => a.display_order - b.display_order).map((m: any) => m.url) || [];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": productImages,
    "description": product.description,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": product.brands?.name || "Anchor Fashion"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://anchorfashion.com/products/${product.slug}`,
      "priceCurrency": "USD",
      "price": product.base_price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <div className="container py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-muted-foreground mb-8">
        <ol className="flex items-center space-x-2">
          <li><Link href="/" className="hover:text-primary">Home</Link></li>
          <li><span>/</span></li>
          <li><Link href="/products" className="hover:text-primary">Products</Link></li>
          <li><span>/</span></li>
          {product.categories && (
            <>
              <li><Link href={`/products?category=${product.categories.slug}`} className="hover:text-primary">{product.categories.name}</Link></li>
              <li><span>/</span></li>
            </>
          )}
          <li className="font-medium text-foreground truncate max-w-[200px] md:max-w-none">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 mb-16">
        {/* Product Gallery */}
        <div>
          <ProductGallery images={productImages} />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {product.brands && (
            <Link href={`/products?brand=${product.brands.slug}`} className="text-sm font-semibold tracking-wider uppercase text-muted-foreground hover:text-primary mb-2 inline-block">
              {product.brands.name}
            </Link>
          )}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="text-2xl font-bold">${Number(product.base_price).toFixed(2)}</div>
            {product.average_rating > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.average_rating) ? "fill-current" : "fill-muted text-muted"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground ml-1">({product.average_rating} rating)</span>
              </div>
            )}
          </div>

          <div className="prose prose-sm text-muted-foreground mb-8">
            <p>{product.description}</p>
          </div>

          {/* Variants Configuration */}
          <div className="space-y-6 mb-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Size</h3>
                <button className="text-sm text-primary flex items-center gap-1 hover:underline">
                  <Ruler className="w-4 h-4" /> Size Guide
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <Button key={size} variant="outline" className="w-full font-normal">
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button size="lg" className="flex-1 text-base h-12">
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-6">
              <Heart className="w-5 h-5 mr-2" />
              Save
            </Button>
            <Button size="lg" variant="ghost" className="h-12 px-4 shrink-0 border border-transparent hover:border-border">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y mb-8 text-sm">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-primary" />
              <span>Free shipping over $150</span>
            </div>
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-primary" />
              <span>Easy 30-day returns</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <span>1-year premium warranty</span>
            </div>
          </div>

          {/* Additional Info Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="description">
              <AccordionTrigger>Product Description</AccordionTrigger>
              <AccordionContent className="prose prose-sm text-muted-foreground">
                <p>{product.description || "Detailed description not available."}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="specifications">
              <AccordionTrigger>Specifications</AccordionTrigger>
              <AccordionContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {product.gender && (
                    <>
                      <dt className="font-medium">Gender</dt>
                      <dd className="text-muted-foreground capitalize">{product.gender.toLowerCase()}</dd>
                    </>
                  )}
                  {product.season && (
                    <>
                      <dt className="font-medium">Season</dt>
                      <dd className="text-muted-foreground capitalize">{product.season}</dd>
                    </>
                  )}
                  {product.sku && (
                    <>
                      <dt className="font-medium">SKU</dt>
                      <dd className="text-muted-foreground uppercase">{product.sku}</dd>
                    </>
                  )}
                </dl>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Related Products */}
      {filteredRelated.length > 0 && (
        <section className="py-12 border-t">
          <h2 className="text-2xl font-bold tracking-tight mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredRelated.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
