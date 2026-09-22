import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

async function checkAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anonKey);

  const { data, error } = await supabase.from("supplier_profiles").select("*");
  console.log("Anon select supplier_profiles:", error ? error.message : `SUCCESS! count: ${data?.length}`);

  const { data: ins, error: insErr } = await supabase.from("supplier_profiles").insert({
    company_name: "Anon Test",
  }).select();
  console.log("Anon insert supplier_profiles:", insErr ? insErr.message : `SUCCESS!`);
}

checkAnon().catch(console.error);
