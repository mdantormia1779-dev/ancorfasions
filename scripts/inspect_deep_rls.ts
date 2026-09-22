import { createAdminClient } from "../lib/supabase/admin-client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

async function inspectRLS() {
  console.log("=== PHASE 4: SUPABASE RLS SECURITY INSPECTION ===");
  const admin = createAdminClient();
  const anon = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check RLS status via pg_tables / pg_policies if available or test queries directly
  const criticalTables = [
    "orders",
    "order_items",
    "customers",
    "profiles",
    "supplier_profiles",
    "warehouses",
    "inventory_levels",
    "stock_movements",
    "payment_transactions",
    "payment_sessions",
    "audit_logs",
    "settings",
    "coupons",
    "returns",
    "products",
    "variants",
  ];

  console.log("\n1. Testing Anonymous Client Access (Direct Table Probing without Auth):");
  for (const table of criticalTables) {
    try {
      const { data, error } = await anon.from(table).select("*").limit(1);
      if (error) {
        console.log(`  [RLS Protected] ${table.padEnd(22)}: Error: ${error.message} (code: ${error.code})`);
      } else {
        const count = data ? data.length : 0;
        console.log(`  [Anon Accessible] ${table.padEnd(20)}: ${count} rows returned (check if public catalog or data leak)`);
      }
    } catch (e: any) {
      console.log(`  [Exception] ${table.padEnd(25)}: ${e.message}`);
    }
  }

  console.log("\n2. Probing Anonymous Insert/Update/Delete Block on Sensitive Tables:");
  const testWriteTables = ["orders", "supplier_profiles", "warehouses", "settings", "audit_logs"];
  for (const table of testWriteTables) {
    try {
      const { error: insErr } = await anon.from(table).insert({ id: "00000000-0000-0000-0000-000000000099" });
      console.log(`  [Anon Insert Test] ${table.padEnd(20)}: ${insErr ? `BLOCKED (${insErr.message})` : "WARNING: ALLOWED!"}`);
    } catch (e: any) {
      console.log(`  [Anon Insert Test] ${table.padEnd(20)}: BLOCKED (${e.message})`);
    }
  }
}

inspectRLS().catch(console.error);
