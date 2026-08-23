import { CollectionRepository } from "@/lib/repositories/catalog/collection.repository";
import { CollectionsClientPage } from "@/features/admin/components/catalog/CollectionsClientPage";

export const metadata = {
  title: "Collections | Catalog | Anchor Fashion Enterprise",
};

export default async function AdminCollectionsPage() {
  // Fetch all collections including inactive ones for management
  const collections = await CollectionRepository.getCollections(false);

  return <CollectionsClientPage initialCollections={collections} />;
}
