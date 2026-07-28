import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";
import { CatalogRepository } from "@/repositories/catalog.repository";
import { getStoreInfo } from "@/lib/actions/settings.actions";
import { createClient } from "@/lib/supabase/server";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [categories, storeInfo] = await Promise.all([
    CatalogRepository.getCategories(),
    getStoreInfo(),
  ]);

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <StoreHeader 
        dbCategories={categories} 
        contactPhone={storeInfo.phone}
        contactEmail={storeInfo.email}
        announcementBar={storeInfo.announcement_bar}
        user={user}
      />
      <main className="flex-1 w-full bg-background">
        {children}
      </main>
      <StoreFooter />
      <MobileBottomNav user={user} />
    </div>
  );
}
