import { ReactNode } from "react";
import { ManagerSidebar } from "@/components/manager/layout/ManagerSidebar";
import { ManagerHeader } from "@/components/manager/layout/ManagerHeader";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manager Dashboard | Anchor Fashion",
  description: "Enterprise operations dashboard for Anchor Fashion managers.",
};

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-muted/20">
      <ManagerSidebar />
      <div className="flex w-full min-w-0 flex-1 flex-col">
        <ManagerHeader />
        <main className="flex w-full flex-1 flex-col p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
