import { AttributeRepository } from "@/lib/repositories/catalog/attribute.repository";
import { AttributesClientPage } from "@/features/admin/components/catalog/AttributesClientPage";

export const metadata = {
  title: "Attributes | Catalog | Anchor Fashion Enterprise",
};

export default async function AdminAttributesPage() {
  // Fetch all attributes with their values
  const attributes = await AttributeRepository.getAttributes();

  return <AttributesClientPage initialAttributes={attributes} />;
}
