import { NextResponse } from "next/server";

// Mocking Supabase connection for the design implementation
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    // This would typically query the bi_sales_mart, bi_customer_mart etc.
    if (type === "sales-rollup") {
      return NextResponse.json({
        data: {
          today: { revenue: 125000, orders: 450, visitors: 12400 },
          yesterday: { revenue: 110000, orders: 380, visitors: 11000 },
          growth: { revenue: 13.6, orders: 18.4, visitors: 12.7 },
        },
      });
    }

    if (type === "custom-report") {
      // Mocking custom report execution
      return NextResponse.json({
        reportName: "Weekly Regional Sales",
        columns: ["Region", "Total Sales", "Orders"],
        rows: [
          ["Dhaka", 500000, 1200],
          ["Chattogram", 250000, 800],
          ["Sylhet", 150000, 450],
        ],
      });
    }

    return NextResponse.json(
      { error: "Invalid type parameter" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch BI data" },
      { status: 500 }
    );
  }
}
