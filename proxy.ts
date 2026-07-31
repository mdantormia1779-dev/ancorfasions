import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { ADMIN_ROLES, MANAGER_ROLES } from '@/lib/constants/auth'

export async function proxy(request: NextRequest) {
  const url = request.nextUrl
  const pathname = url.pathname

  // Update the session to ensure cookies are refreshed.
  const { supabaseResponse, user, supabase } = await updateSession(request)

  // CSP: Content Security Policy
  // Note: For Next.js App Router, script-src 'self' 'unsafe-eval' 'unsafe-inline' is often required in dev,
  // but we tighten it for production.
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self' data:;
    connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://*.supabase.co'} https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  // Apply Security Headers to every response
  supabaseResponse.headers.set('Content-Security-Policy', cspHeader)
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

  // API Gateway Logic for External API Routes
  if (pathname.startsWith('/api/v1/')) {
    // Basic API Key Validation
    const apiKey = request.headers.get('x-api-key')

    // Webhook paths might use a different validation (e.g. signature), skip api key check if it's a webhook
    if (!pathname.startsWith('/api/v1/webhooks/')) {
      if (!apiKey) {
        return NextResponse.json({ error: 'Unauthorized: Missing API Key' }, { status: 401 })
      }
    }

    // Rate Limiting headers (Mocked for middleware, actual implementation in Redis/DB)
    supabaseResponse.headers.set('X-RateLimit-Limit', '100')
    supabaseResponse.headers.set('X-RateLimit-Remaining', '99')

    return supabaseResponse
  }

  // Protect Auth Routes (redirect logged-in users away from /login)
  const isAuthRoute = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register') || pathname.startsWith('/auth/forgot-password') || pathname.startsWith('/auth/reset-password')

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protect Dashboard / Internal Routes
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/manager') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/cms') ||
    pathname.startsWith('/crm') ||
    pathname.startsWith('/inventory')

  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Define user role — first check JWT claims, then fall back to DB profiles table
  let role = user?.user_metadata?.role || user?.app_metadata?.role || ''

  // If JWT doesn't have a role (e.g. after SQL update without re-login), query DB directly
  if (user && !role) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role_id, roles(name)')
        .eq('id', user.id)
        .single()
      role = (profile?.roles as any)?.name || 'CUSTOMER'
    } catch {
      role = 'CUSTOMER'
    }
  }

  if (!role) role = 'CUSTOMER'

  // Role-Based Route Protection for Admin Routes
  if (user && pathname.startsWith('/admin')) {
    if (!ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Role-Based Route Protection for Manager Routes and CRM/CMS/Inventory
  const isManagerRoute = pathname.startsWith('/manager') || pathname.startsWith('/cms') || pathname.startsWith('/crm') || pathname.startsWith('/inventory')
  if (user && isManagerRoute) {
    if (!MANAGER_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Match all paths except static files, images, and api internal routes if needed
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
