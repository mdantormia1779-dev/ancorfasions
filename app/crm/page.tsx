import AdminLayout from "@/app/(admin)/admin/layout";
import CRMDashboardPage from "@/app/(admin)/admin/customers/page";

export default function CRMPage() {
  return (
    <AdminLayout>
      <CRMDashboardPage />
    </AdminLayout>
  );
}
