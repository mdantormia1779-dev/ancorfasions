import { Metadata } from "next";
import { CustomerService } from "@/lib/services/customer.service";
import { ProfileEditor } from "@/components/customer/ProfileEditor";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile Management | Anchor Fashion",
  description: "Manage your profile information and preferences.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/account/profile");
  }

  let profile = null;
  try {
    const customerService = new CustomerService();
    profile = await customerService.getProfile(user.id);
  } catch (err) {
    console.error("Error fetching customer profile:", err);
  }

  // Fallback profile if DB record is temporarily unavailable or new
  const resolvedProfile = profile || {
    id: user.id,
    first_name:
      user.user_metadata?.first_name ||
      user.user_metadata?.full_name?.split(" ")[0] ||
      user.user_metadata?.name?.split(" ")[0] ||
      "",
    last_name:
      user.user_metadata?.last_name ||
      user.user_metadata?.full_name?.split(" ").slice(1).join(" ") ||
      user.user_metadata?.name?.split(" ").slice(1).join(" ") ||
      "",
    email: user.email || "",
    phone: user.phone || user.user_metadata?.phone || "",
    avatar_url: user.user_metadata?.avatar_url || null,
    date_of_birth: null,
    is_active: true,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Profile Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal information, contact phone, and account details.
        </p>
      </div>
      <ProfileEditor profile={resolvedProfile as any} />
    </div>
  );
}
