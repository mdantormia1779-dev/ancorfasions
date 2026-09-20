import { NextRequest, NextResponse } from "next/server";
import { AlphaSmsService } from "@/lib/services/sms/alpha-sms.service";

/**
 * GET /api/orders/:orderId/sms-logs
 * Retrieves all SMS delivery audit logs for a specific order
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId in route" }, { status: 400 });
    }

    const logs = await AlphaSmsService.getOrderSmsLogs(orderId);

    return NextResponse.json({
      success: true,
      orderId,
      count: logs.length,
      logs,
    });
  } catch (error: any) {
    console.error("GET /api/orders/:orderId/sms-logs exception:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
