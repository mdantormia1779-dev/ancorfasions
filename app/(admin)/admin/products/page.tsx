import { Metadata } from "next";
import { ProductsTable } from "@/features/admin/components/products/ProductsTable";
import { getAdminProductsAction } from "@/lib/actions/admin/products.actions";

export const metadata: Metadata = {
  title: "Products | Admin Dashboard",
  description: "Manage your store catalog and products.",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const search = searchParams.search || "";
  const page = parseInt(searchParams.page || "1", 10);

  const res = await getAdminProductsAction({ search, page, limit: 20 });
  
  const products = res.data?.products || [];
  const totalCount = res.data?.total || 0;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your catalog, inventory, and product visibility.
        </p>
      </div>

      <ProductsTable initialProducts={products} totalCount={totalCount} />
    </div>
  );
}
