import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { logServerError } from "@/lib/utils/error-handler";
import { cookies } from "next/headers";
import { CartService } from "@/lib/services/cart.service";

export async function POST(request: Request) {
  try {
    const { email, otp, name, password, phone } = await request.json();

    if (!email || !otp || !name || !password) {
      return NextResponse.json(
        { error: "Missing required fields: email, otp, name, and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();
    const supabase = createAdminClient();
    const nowIso = new Date().toISOString();

    // 1. Verify OTP with Admin Client to bypass RLS safely on server
    const { data: otpRecords, error: otpError } = await supabase
      .from("registration_otps")
      .select("*")
      .eq("email", cleanEmail)
      .eq("otp", cleanOtp)
      .gte("expires_at", nowIso)
      .order("created_at", { ascending: false })
      .limit(1);

    if (otpError) {
      logServerError("AUTH_VERIFY_REGISTER_OTP_QUERY", otpError, { email: cleanEmail });
      return NextResponse.json({ error: "Error verifying OTP code." }, { status: 500 });
    }

    if (!otpRecords || otpRecords.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // 2. Register user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name,
          phone: phone || "",
          role: "customer",
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 3. Upsert customer profile
    if (authData.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: authData.user.id,
        email: cleanEmail,
        full_name: name,
        role: "customer",
      });

      if (profileError) {
        logServerError("AUTH_REGISTER_PROFILE_UPSERT", profileError, { userId: authData.user.id });
      }

      // Also ensure entry in customer_profiles
      await supabase.from("customer_profiles").upsert({
        id: authData.user.id,
        email: cleanEmail,
        first_name: name.split(" ")[0] || name,
        last_name: name.split(" ").slice(1).join(" ") || "",
        phone: phone || null,
        is_active: true,
      });
    }

    // 4. Invalidate and delete used OTP to prevent reuse
    await supabase.from("registration_otps").delete().eq("email", cleanEmail);

    // 5. Merge guest cart if applicable
    if (authData.user) {
      const cookieStore = await cookies();
      const guestSessionId = cookieStore.get("af_guest_session")?.value;
      if (guestSessionId) {
        try {
          await CartService.mergeGuestCart(guestSessionId, authData.user.id);
          cookieStore.delete("af_guest_session");
        } catch (mergeError) {
          logServerError("AUTH_REGISTER_CART_MERGE", mergeError, { userId: authData.user.id });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      user: authData.user,
    });
  } catch (error: any) {
    logServerError("AUTH_VERIFY_REGISTER_FATAL", error);
    return NextResponse.json({ error: "Internal server error occurred." }, { status: 500 });
  }
}
