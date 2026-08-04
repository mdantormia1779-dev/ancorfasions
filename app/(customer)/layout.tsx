import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";
import { CatalogRepository } from "@/repositories/catalog.repository";
import { createClient } from "@/lib/supabase/server";
export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const categories = await CatalogRepository.getCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader dbCategories={categories} user={user} />
      <main className="w-full flex-1 bg-background">{children}</main>
      <StoreFooter />
    </div>
  );
}
