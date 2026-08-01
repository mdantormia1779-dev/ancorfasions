import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { ADMIN_ROLES, MANAGER_ROLES } from "@/lib/constants/auth";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Update the session to ensure cookies are refreshed.
  const { supabaseResponse, user, supabase } = await updateSession(request);

  // CSP: Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self' data:;
    connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://*.supabase.co"} https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  // Apply Security Headers to every response
  supabaseResponse.headers.set("Content-Security-Policy", cspHeader);
  supabaseResponse.headers.set("X-Frame-Options", "DENY");
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );
  supabaseResponse.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  // API Gateway Logic for External API Routes
  if (pathname.startsWith("/api/v1/")) {
    const apiKey = request.headers.get("x-api-key");
    if (!pathname.startsWith("/api/v1/webhooks/")) {
      if (!apiKey) {
        return NextResponse.json(
          { error: "Unauthorized: Missing API Key" },
          { status: 401 }
        );
      }
    }
    supabaseResponse.headers.set("X-RateLimit-Limit", "100");
    supabaseResponse.headers.set("X-RateLimit-Remaining", "99");
    return supabaseResponse;
  }

  // Protect Auth Routes
  const isAuthRoute =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/register") ||
    pathname.startsWith("/auth/forgot-password") ||
    pathname.startsWith("/auth/reset-password");

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect Internal and Customer Routes
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/manager") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/cms") ||
    pathname.startsWith("/crm") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/customer");

  // Protect Internal API Routes as well (everything in /api/ except /api/v1 which is handled above)
  const isInternalApiRoute = pathname.startsWith("/api/") && !pathname.startsWith("/api/v1/");
  
  if (!user && (isProtectedRoute || isInternalApiRoute)) {
    if (isInternalApiRoute) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Role resolution
  let role = user?.user_metadata?.role || user?.app_metadata?.role || "";

  if (user && !role) {
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

  // Role-Based Route Protection for Admin Routes (including API)
  if (user && (pathname.startsWith("/admin") || pathname.startsWith("/api/admin"))) {
    if (!ADMIN_ROLES.includes(role)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Role-Based Route Protection for Manager Routes (including API)
  const isManagerPath =
    pathname.startsWith("/manager") ||
    pathname.startsWith("/cms") ||
    pathname.startsWith("/crm") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/api/manager") ||
    pathname.startsWith("/api/cms");

  if (user && isManagerPath) {
    if (!MANAGER_ROLES.includes(role)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
