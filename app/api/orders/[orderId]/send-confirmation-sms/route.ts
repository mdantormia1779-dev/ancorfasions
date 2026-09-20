import { NextRequest, NextResponse } from "next/server";
import { AlphaSmsService } from "@/lib/services/sms/alpha-sms.service";

/**
 * POST /api/orders/:orderId/send-confirmation-sms
 * Triggers or resends confirmation SMS for a confirmed order
 * Query params: ?force=true (bypass duplicate check)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId in route" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    const result = await AlphaSmsService.sendOrderConfirmationSMS(orderId, {
      force,
    });

    return NextResponse.json(
      {
        success: result.success,
        status: result.status,
        recipient: result.phone,
        message: result.message,
        requestId: result.requestId || null,
        skipped: !!result.skipped,
        reason: result.reason || null,
        error: result.error || null,
      },
      { status: result.success ? 200 : 400 }
    );
  } catch (error: any) {
    console.error("POST /api/orders/:orderId/send-confirmation-sms exception:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
