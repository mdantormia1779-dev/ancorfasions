import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      const isInvalidRefreshToken =
        error.name === "AuthSessionMissingError" ||
        error.code === "refresh_token_not_found" ||
        (error as any).status === 400 ||
        error.message?.toLowerCase().includes("refresh token");

      if (isInvalidRefreshToken) {
        // Clear all Supabase auth cookies
        const allCookies = request.cookies.getAll();
        allCookies.forEach((c) => {
          if (c.name.startsWith("sb-") || c.name.includes("auth-token")) {
            request.cookies.delete(c.name);
            supabaseResponse.cookies.set(c.name, "", {
              maxAge: 0,
              path: "/",
            });
          }
        });

        // Re-serialize the remaining cookies into request.headers so downstream Server Components don't receive dead cookies
        const remainingCookieHeader = request.cookies
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; ");
        request.headers.set("cookie", remainingCookieHeader);

        // Update supabaseResponse to forward updated request headers
        const existingCookies = supabaseResponse.cookies.getAll();
        supabaseResponse = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        existingCookies.forEach((c) => {
          supabaseResponse.cookies.set(c);
        });
      }
    } else {
      user = data?.user ?? null;
    }
  } catch (error) {
    console.warn(
      "Supabase auth error in middleware (is Supabase running?):",
      error
    );
  }

  return { supabaseResponse, user, supabase };
}
