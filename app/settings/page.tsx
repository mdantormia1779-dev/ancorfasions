import AdminLayout from "@/app/(admin)/admin/layout";
import BusinessSettingsPage from "@/app/(admin)/admin/settings/page";

export default function SettingsPage() {
  return (
    <AdminLayout>
      <BusinessSettingsPage />
    </AdminLayout>
  );
}
