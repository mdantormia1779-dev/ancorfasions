import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.warn("Testing Brands...");
  const { data: brands, error: brandError } = await supabase.from("brands").select("*");
  if (brandError) console.error("Brand error:", brandError);
  else console.warn("Brands found:", brands?.length);

  console.warn("Testing Categories...");
  const { data: categories, error: catError } = await supabase.from("categories").select("*");
  if (catError) console.error("Category error:", catError);
  else console.warn("Categories found:", categories?.length);
  
  console.warn("Testing Collections...");
  const { data: collections, error: colError } = await supabase.from("collections").select("*");
  if (colError) console.error("Collection error:", colError);
  else console.warn("Collections found:", collections?.length);
}

test();
