import { Metadata } from "next";
import { CatalogService } from "@/lib/services/catalog.service";
import { ReviewRepository } from "@/lib/repositories/catalog/review.repository";
import { FlashSaleService } from "@/lib/services/marketing/flash-sale.service";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await CatalogService.getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Anchor Fashion",
    };
  }

  return {
    title: `${product.name} | Anchor Fashion`,
    description:
      product.description ||
      product.short_description ||
      `Shop ${product.name} at Anchor Fashion. Premium luxury fashion & modern apparel.`,
    openGraph: {
      title: `${product.name} | Anchor Fashion`,
      description:
        product.description ||
        product.short_description ||
        `Shop ${product.name} at Anchor Fashion.`,
      images: product.product_media?.[0]?.url ? [product.product_media[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await CatalogService.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // 1. Fetch active flash sale for product if one exists
  const flashSale = await FlashSaleService.getFlashSaleForProduct(product.id);

  // 2. Fetch related products in the same category
  let relatedProducts: any[] = [];
  if (product.categories?.slug) {
    const { data } = await CatalogService.getProducts({
      category: product.categories.slug,
      limit: 5,
    });
    relatedProducts = (data || []).filter((p: any) => p.id !== product.id);
  }

  // 3. Fetch real reviews from database
  const reviews = await ReviewRepository.getReviewsByProductId(product.id);

  // 4. Build JSON-LD structured metadata
  const isInStock = (product as any).is_in_stock ?? false;
  const images =
    product.product_media?.map((m: any) => m.url) || ["/images/placeholder.webp"];

  const effectivePrice =
    flashSale?.flash_price ?? product.sale_price ?? product.base_price;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images,
    description:
      product.description || "Buy premium luxury wear from Anchor Fashion.",
    sku: product.sku || undefined,
    brand: {
      "@type": "Brand",
      name: (product as any).brands?.name || "Anchor Fashion",
    },
    offers: {
      "@type": "Offer",
      url: `https://anchorfashion.com/product/${product.slug}`,
      priceCurrency: "BDT",
      price: effectivePrice,
      itemCondition: "https://schema.org/NewCondition",
      availability: isInStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailView
        product={product}
        flashSale={flashSale}
        reviews={reviews}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
