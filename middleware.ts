import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const ADMIN_ROLES = ["SUPERADMIN", "ADMIN"];
const MANAGER_ROLES = [
  "MANAGER",
  "WAREHOUSE_MANAGER",
  "MARKETING_MANAGER",
  "FINANCE_MANAGER",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Update session (refresh Supabase auth cookies)
  const { supabaseResponse, user, supabase } = await updateSession(request);

  // ─── Redirect logged-in users away from auth pages ───────────────────────
  const isAuthRoute =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/register") ||
    pathname.startsWith("/auth/forgot-password") ||
    pathname.startsWith("/auth/reset-password");

  if (user && isAuthRoute) {
    const currentRole: string =
      user.user_metadata?.role || user.app_metadata?.role || "CUSTOMER";
    if (ADMIN_ROLES.includes(currentRole)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else if (MANAGER_ROLES.includes(currentRole)) {
      return NextResponse.redirect(new URL("/manager", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ─── Protect private routes ───────────────────────────────────────────────
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/manager") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/cms") ||
    pathname.startsWith("/crm") ||
    pathname.startsWith("/inventory");

  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ─── Role-based access control ────────────────────────────────────────────
  if (user && isProtectedRoute) {
    let role: string =
      user.user_metadata?.role || user.app_metadata?.role || "";

    // If JWT has no role, fall back to DB query
    if (!role) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role_id, roles(name)")
          .eq("id", user.id)
          .single();
        role = (profile?.roles as any)?.name || "CUSTOMER";
      } catch {
        role = "CUSTOMER";
      }
    }

    if (!role) role = "CUSTOMER";

    if (pathname.startsWith("/admin") && !ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const isManagerRoute =
      pathname.startsWith("/manager") ||
      pathname.startsWith("/cms") ||
      pathname.startsWith("/crm") ||
      pathname.startsWith("/inventory");

    if (isManagerRoute && !MANAGER_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public image files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
