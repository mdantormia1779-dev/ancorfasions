import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy_key";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Ideally, verify Resend Webhook Signature here
    // using svix or the resend provided mechanism

    const eventType = payload.type; // e.g. email.sent, email.delivered, email.bounced, email.clicked
    const data = payload.data; // contains message_id

    if (!data || !data.email_id) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    let status = "PENDING";
    if (eventType === "email.delivered") status = "DELIVERED";
    else if (eventType === "email.bounced") status = "BOUNCED";
    else if (eventType === "email.clicked") status = "CLICKED";
    else if (eventType === "email.opened") status = "OPENED";
    else if (eventType === "email.sent") status = "SENT";

    const { error } = await supabase
      .from("notification_logs")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("provider_id", data.email_id)
      .eq("channel", "email");

    if (error) {
      console.error("Failed to update log status:", error);
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
