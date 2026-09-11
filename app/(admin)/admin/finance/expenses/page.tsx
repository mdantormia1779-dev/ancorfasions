import React from "react";
import { Metadata } from "next";
import { ExpenseRepository } from "@/repositories/expense.repository";
import { WarehouseRepository } from "@/repositories/warehouse.repository";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { ExpensesClient } from "@/features/finance/components/ExpensesClient";

export const metadata: Metadata = {
  title: "Expenses & Outgoing Capital | Anchor Fashion Admin",
  description: "Enterprise expense ledger and operational expenditure tracking",
};

export const dynamic = "force-dynamic";

export default async function ExpensesManagementPage() {
  const expenseRepo = new ExpenseRepository();
  const warehouseRepo = new WarehouseRepository();
  const supabase = createAdminClient();

  // Fetch real data safely in parallel
  const [expenses, warehouses, branchesResult] = await Promise.all([
    expenseRepo.getExpenses().catch((err: any) => {
      console.error("[ExpensesManagementPage] Error fetching expenses:", err);
      return [];
    }),
    warehouseRepo.getAllWarehouses().catch((err: any) => {
      console.error("[ExpensesManagementPage] Error fetching warehouses:", err);
      return [];
    }),
    Promise.resolve(
      supabase
        .from("branches")
        .select("id, name")
        .eq("status", "active")
        .order("name")
    ).then((res) => res.data || []).catch((err: any) => {
      console.error("[ExpensesManagementPage] Error fetching branches:", err);
      return [];
    }),
  ]);

  const activeBranches = (branchesResult as any[]) || [];

  return (
    <ExpensesClient
      initialExpenses={expenses}
      warehouses={(warehouses as any[]).map((w: any) => ({ id: String(w.id), name: String(w.name) }))}
      branches={activeBranches.map((b: any) => ({ id: String(b.id), name: String(b.name) }))}
    />
  );
}
