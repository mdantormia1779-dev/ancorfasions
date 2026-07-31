const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding BI Dashboard Data...");

  // Create last 7 days of data
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Randomize some realistic numbers
    const total_revenue = 40000 + Math.random() * 20000;
    const total_orders = Math.floor(total_revenue / (100 + Math.random() * 50));

    data.push({
      date: date.toISOString().split("T")[0],
      total_revenue: parseFloat(total_revenue.toFixed(2)),
      total_orders,
      total_profit: parseFloat((total_revenue * 0.35).toFixed(2)),
      total_refunds: parseFloat((total_revenue * 0.05).toFixed(2)),
      aov: parseFloat((total_revenue / total_orders).toFixed(2)),
      new_customers: Math.floor(total_orders * 0.4),
      returning_customers: Math.floor(total_orders * 0.6),
    });
  }

  const { error } = await supabase
    .from("bi_daily_revenue_rollup")
    .upsert(data, { onConflict: "date" });

  if (error) {
    console.error("Error seeding BI data:", error.message);
  } else {
    console.log(
      "Successfully seeded 7 days of revenue data for Executive Command Center!"
    );
  }
}

seed();
