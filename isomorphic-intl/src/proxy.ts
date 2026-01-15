import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Create next-intl middleware
const intlMiddleware = createMiddleware({
  ...routing,
});

// Define public routes that don't require authentication
const publicRoutes = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password-1",
  "/auth/otp-1",
  "/auth/set-password",
  "/auth/driver-signup",
  "/auth/seller-signup",
];

function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if route is an API auth route or manifest FIRST
  const isApiAuth = pathname.startsWith("/api/auth/");
  const isManifest = pathname === "/manifest.json";
  const isApiRoute = pathname.startsWith("/api/");

  if (isApiAuth || isManifest || isApiRoute) {
    return NextResponse.next();
  }

  // Get session token FIRST before any routing decisions
  const sessionToken = req.cookies.get("next-auth.session-token")?.value ||
                       req.cookies.get("__Secure-next-auth.session-token")?.value;

  // Extract language from pathname
  const localeMatch = routing.locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  const lang = localeMatch || routing.defaultLocale;

  // Check if route is a public route (EXACT match only with language prefix)
  const isPublicRoute = publicRoutes.some(route => {
    const localizedRoute = `/${lang}${route}`;
    return pathname === localizedRoute;
  });

  // Check if this is a root path (/, /en, /ar, etc.)
  const isRootPath = pathname === "/" || pathname === `/${lang}` || pathname === `/${lang}/`;

  // If user is trying to access ANY route without authentication (except public routes)
  if (!sessionToken && !isPublicRoute) {
    console.log(`🔒 No session token, redirecting to signin. Path: ${pathname}`);
    const signinUrl = new URL(`/${lang}/auth/sign-in`, req.url);

    // Set callback URL for protected routes
    if (!pathname.includes('/sign-in') && !isRootPath) {
      signinUrl.searchParams.set('callbackUrl', pathname);
    }

    return NextResponse.redirect(signinUrl);
  }

  // If it's a public route, allow access
  if (isPublicRoute) {
    console.log(`✅ Public route allowed: ${pathname}`);
    return intlMiddleware(req);
  }

  // Redirect URLs without language prefix
  const hasLanguagePrefix = routing.locales.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );

  if (!hasLanguagePrefix && pathname !== "/" && !pathname.startsWith("/_next")) {
    const redirectUrl = new URL(`/${lang}${pathname}`, req.url);
    console.log(`🔄 Redirecting URL without language prefix: ${pathname} -> ${redirectUrl.pathname}`);
    return NextResponse.redirect(redirectUrl);
  }

  // User is authenticated, proceed with intl middleware
  console.log(`✅ Authenticated user accessing: ${pathname}`);
  return intlMiddleware(req);
}

// Export middleware as default
export default middleware;

export const config = {
  // Match all paths except static files, images, and Next.js internals
  matcher: [
    /*
     * Match all request paths except for:
     * - _next (Next.js internals)
     * - Static files (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};
