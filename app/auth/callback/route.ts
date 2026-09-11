import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { CartService } from "@/lib/services/cart.service";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/account/profile";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (data?.user) {
        try {
          const cookieStore = await cookies();
          const guestSessionId = cookieStore.get("af_guest_session")?.value;
          if (guestSessionId) {
            await CartService.mergeGuestCart(guestSessionId, data.user.id);
            cookieStore.delete("af_guest_session");
          }
        } catch (mergeErr) {
          console.error("Cart merge error in auth callback:", mergeErr);
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalhost = process.env.NODE_ENV === "development";
      if (isLocalhost) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
