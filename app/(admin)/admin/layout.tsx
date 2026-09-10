import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/features/admin/components/AdminSidebar";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { MobileAppBanner } from "@/features/admin/components/MobileAppBanner";
import { createClient } from "@/lib/supabase/server";
import { STAFF_ROLES } from "@/lib/constants/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard | Anchor Fashion",
  description: "Enterprise Executive Command Center",
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Server-side auth guard — second layer of protection
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  let role = user.user_metadata?.role || user.app_metadata?.role;
  if (!role) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("roles(name)")
        .eq("id", user.id)
        .single();
      role = (profile?.roles as any)?.name;
    } catch {
      role = "CUSTOMER";
    }
  }
  if (!role) role = "CUSTOMER";

  if (!STAFF_ROLES.includes(role)) {
    redirect("/account/profile");
  }


  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-background text-slate-900 dark:text-foreground">
      <AdminSidebar role={role} className="hidden md:flex" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader user={user} role={role} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50 dark:bg-background">
          {children}
        </main>
      </div>
      <MobileAppBanner />
    </div>
  );
}
