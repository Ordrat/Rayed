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

  // Extract language from pathname
  const localeMatch = routing.locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  const lang = localeMatch || routing.defaultLocale;

  // Redirect URLs without language prefix
  const hasLanguagePrefix = routing.locales.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );

  if (!hasLanguagePrefix && pathname !== "/" && !pathname.startsWith("/_next")) {
    const redirectUrl = new URL(`/${lang}${pathname}`, req.url);
    console.log(`🔄 Redirecting URL without language prefix: ${pathname} -> ${redirectUrl.pathname}`);
    return NextResponse.redirect(redirectUrl);
  }

  // Get refresh token from cookie (NextAuth stores it in the session token)
  const sessionToken = req.cookies.get("next-auth.session-token")?.value ||
                       req.cookies.get("__Secure-next-auth.session-token")?.value;

  // Check if route is a public route (EXACT match only with language prefix)
  const isPublicRoute = publicRoutes.some(route => {
    const localizedRoute = `/${lang}${route}`;
    return pathname === localizedRoute;
  });

  // Also check for root path without locale
  const isRootPath = pathname === "/" || pathname === `/${lang}` || pathname === `/${lang}/`;

  if (isPublicRoute || isRootPath) {
    console.log(`✅ Public route allowed: ${pathname}`);
    return intlMiddleware(req);
  }

  // Auth check - redirect to signin if no session token
  if (!sessionToken) {
    console.log(`🔒 No session token, redirecting to signin. Path: ${pathname}`);
    const signinUrl = new URL(`/${lang}/auth/sign-in`, req.url);

    // Only set callbackUrl if it's a valid protected route (not a malformed URL)
    if (!pathname.includes('/sign-in/') && pathname !== `/${lang}/auth/sign-in`) {
      signinUrl.searchParams.set('callbackUrl', pathname);
    }

    return NextResponse.redirect(signinUrl);
  }

  // User is authenticated, proceed with intl middleware
  return intlMiddleware(req);
}

// Export middleware as default
export default middleware;

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
