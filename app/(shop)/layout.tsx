import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";
import { CatalogRepository } from "@/repositories/catalog.repository";
import { getStoreInfo } from "@/lib/actions/settings.actions";
import { createClient } from "@/lib/supabase/server";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { FloatingPromotion } from "@/components/marketing/floating-promotion";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [categories, storeInfo] = await Promise.all([
    CatalogRepository.getCategories(),
    getStoreInfo(),
  ]);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Anchor Fashion",
    "url": "https://anchorfashion.com",
    "logo": "https://anchorfashion.com/icon.svg",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": storeInfo.phone || "+8801XXXXXXXXX",
      "contactType": "customer service"
    }
  };

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <StoreHeader
        dbCategories={categories}
        contactPhone={storeInfo.phone}
        contactEmail={storeInfo.email}
        announcementBar={storeInfo.announcement_bar}
        user={user}
      />
      <main className="w-full flex-1 bg-background">{children}</main>
      <StoreFooter />
      <MobileBottomNav user={user} />
      <FloatingPromotion />
    </div>
  );
}
