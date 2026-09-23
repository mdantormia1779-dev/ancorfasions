import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { ManagerSidebar } from "@/components/manager/layout/ManagerSidebar";
import { ManagerHeader } from "@/components/manager/layout/ManagerHeader";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MANAGER_ROLES } from "@/lib/constants/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manager Dashboard | Anchor Fashion",
  description: "Enterprise operations dashboard for Anchor Fashion managers.",
};

export default async function ManagerLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/manager");
  }

  const role =
    user.user_metadata?.role || user.app_metadata?.role || "CUSTOMER";
    
  // Sub-admins must have a role included in MANAGER_ROLES
  if (!MANAGER_ROLES.includes(role)) {
    redirect("/account/profile");
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/20">
      <ManagerSidebar />
      <div className="flex w-full min-w-0 flex-1 flex-col">
        <ManagerHeader user={user} />
        <main className="flex w-full flex-1 flex-col p-4 lg:p-6">
          <div className="mx-auto w-full max-w-[1600px] flex-1 flex flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
