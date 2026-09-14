import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ManagerPOS } from "@/components/pos/manager-pos";

export const metadata: Metadata = {
  title: "Create Order | Manager Dashboard",
};

export default async function NewOrderPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/manager/login");
  }

  // Determine branch_id
  let branchId = "";
  const role = user.user_metadata?.role || user.app_metadata?.role;

  if (role !== "admin") {
    const { data: employee } = await supabase
      .from("employee_profiles")
      .select("branch_id")
      .eq("id", user.id)
      .single();
    
    if (employee && employee.branch_id) {
      branchId = employee.branch_id;
    } else {
      return (
        <div className="p-8 text-center text-red-600 border border-red-200 bg-red-50 rounded">
          You are not assigned to a branch. Cannot create orders.
        </div>
      );
    }
  } else {
    // Admins need a branch_id to create orders. In a real app, they'd have a dropdown to select one.
    // For this implementation, we fetch the first branch as a default, or they must have one.
    const { data: defaultBranch } = await supabase.from("branches").select("id").limit(1).single();
    if (defaultBranch) {
      branchId = defaultBranch.id;
    } else {
       return (
        <div className="p-8 text-center text-red-600 border border-red-200 bg-red-50 rounded">
          No branches configured in the system.
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Manager POS</h1>
      </div>
      <ManagerPOS branchId={branchId} />
    </div>
  );
}
