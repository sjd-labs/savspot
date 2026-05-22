import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/constants';

/**
 * Maintenance gate. When MAINTENANCE_MODE=1 is set as a Vercel env var,
 * every non-static request to the web app returns a 503 maintenance page.
 * Toggle on:  `vercel env add MAINTENANCE_MODE production` (value: 1)
 * Toggle off: `vercel env rm MAINTENANCE_MODE production`
 * Both require a redeploy to take effect (env is read at build time).
 */
const MAINTENANCE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>SavSpot — Scheduled maintenance</title>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fafafa; color: #18181b; }
  @media (prefers-color-scheme: dark) { body { background: #09090b; color: #fafafa; } }
  main { max-width: 480px; padding: 32px 24px; text-align: center; }
  h1 { font-size: 24px; font-weight: 600; margin: 0 0 12px; letter-spacing: -0.01em; }
  p { font-size: 15px; line-height: 1.55; margin: 0 0 8px; opacity: 0.75; }
  .spot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; margin-right: 8px; vertical-align: middle; animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
</style>
</head>
<body>
<main>
  <h1><span class="spot"></span>Scheduled maintenance</h1>
  <p>SavSpot is offline for a brief upgrade window.</p>
  <p>We'll be back shortly. Thanks for your patience.</p>
</main>
</body>
</html>`;

const AUTH_PAGES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/accept-invitation',
];

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/calendar',
  '/bookings',
  '/services',
  '/clients',
  '/payments',
  '/settings',
  '/onboarding',
  '/portal',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Maintenance gate: serve a 503 maintenance page for every non-static
  // route when MAINTENANCE_MODE is enabled. Health probes / static assets
  // already bypass middleware via the matcher below.
  if (process.env['MAINTENANCE_MODE'] === '1') {
    return new NextResponse(MAINTENANCE_HTML, {
      status: 503,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store, no-cache, must-revalidate',
        'retry-after': '3600',
      },
    });
  }

  const hasSession = request.cookies.get(SESSION_COOKIE_NAME)?.value === 'true';

  // Redirect authenticated users away from auth pages
  if (hasSession && AUTH_PAGES.some((page) => pathname.startsWith(page))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (
    !hasSession &&
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
