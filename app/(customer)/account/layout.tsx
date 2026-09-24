import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import { LogoutButton } from "@/components/auth/logout-button";

import { AccountNav } from "@/components/customer/account-nav";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="w-full shrink-0 md:w-64">
          <AccountNav />
          <div className="my-4 border-t border-slate-200 dark:border-slate-800"></div>
          <LogoutButton />
        </aside>

        <main className="flex-1 overflow-hidden rounded-xl border bg-card p-6 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
