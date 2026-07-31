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
  console.log("Seeding Manager Tasks Data...");

  const tasks = [
    {
      title: "Review Refund Request ORD-5316",
      description:
        "Customer claimed the item was damaged upon arrival. Need to check evidence photos.",
      priority: "high",
      status: "pending",
      related_entity_type: "Support",
      due_date: new Date().toISOString(),
    },
    {
      title: "Approve New Summer Collection",
      description:
        "Review the draft products created by the merchandising team.",
      priority: "medium",
      status: "pending",
      related_entity_type: "Catalog",
      due_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    },
    {
      title: "Schedule Email Newsletter",
      description: "Finalize the draft for the weekend flash sale.",
      priority: "low",
      status: "pending",
      related_entity_type: "Marketing",
      due_date: new Date(Date.now() + 86400000 * 2).toISOString(), // In 2 days
    },
    {
      title: "Inventory Audit - NY Warehouse",
      description: "Coordinating with warehouse manager for Q2 stock check.",
      priority: "medium",
      status: "in_progress",
      related_entity_type: "Inventory",
      due_date: new Date(Date.now() + 86400000 * 7).toISOString(), // Next week
    },
    {
      title: "Process Wholesale Order",
      description: "Fulfill order #WH-102 for boutique partner.",
      priority: "high",
      status: "completed",
      related_entity_type: "B2B",
      completed_at: new Date().toISOString(),
    },
    {
      title: "Update FAQ Page",
      description: "Add new questions regarding international shipping.",
      priority: "low",
      status: "completed",
      related_entity_type: "CMS",
      completed_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const { error } = await supabase.from("manager_tasks").insert(tasks);

  if (error) {
    console.error("Error seeding manager tasks:", error.message);
  } else {
    console.log("Successfully seeded Manager Tasks!");
  }
}

seed();
