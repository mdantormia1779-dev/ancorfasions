import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";
import { CatalogRepository } from "@/repositories/catalog.repository";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await CatalogRepository.getCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader dbCategories={categories} />
      <main className="w-full flex-1 bg-background">{children}</main>
      <StoreFooter />
    </div>
  );
}
