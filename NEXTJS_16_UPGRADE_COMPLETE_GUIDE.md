# AI Agent Prompt: Next.js 16.1 Upgrade with Complete Fixes

## ⚠️ CRITICAL: Turbopack Monorepo Fix

**THE #1 ISSUE YOU WILL FACE:** Turbopack FATAL panic error:
```
FileSystemPath("isomorphic-intl").join("../../packages/isomorphic-core/src") leaves the filesystem root
```

**THE FIX:** In `tailwind.config.ts`, change:
```typescript
'../../packages/isomorphic-core/src/**/*.{js,ts,jsx,tsx}'  // ❌ FAILS
```
to:
```typescript
'./node_modules/core/src/**/*.{js,ts,jsx,tsx}'  // ✅ WORKS
```

See **PHASE 5** for full details. This is the most common Turbopack error in monorepo setups and is not well documented.

---

## Prompt for AI Agent

```
You are an expert Next.js developer. Upgrade my Next.js application from version 15.5.9 to 16.1.1 with all necessary fixes, security patches, and breaking change resolutions. Follow these steps precisely:

## PHASE 1: PREPARATION & DEPENDENCY UPGRADE

1. Check current versions in package.json files
2. Update root package.json with React 19.2.3 overrides:
   ```json
   {
     "pnpm": {
       "overrides": {
         "react": "19.2.3",
         "react-dom": "19.2.3"
       }
     }
   }
   ```

3. Update apps/isomorphic-i18n/package.json dependencies:
   - next: "16.1.1"
   - react: "19.2.3"
   - react-dom: "19.2.3"
   - eslint-config-next: "16.1.1"

4. Run: pnpm install

## PHASE 2: NEXT.JS CONFIGURATION

5. Next.js 16 uses Turbopack by default:
   - No special configuration needed in next.config.mjs
   - Turbopack will work after fixing tailwind.config.ts (Phase 5)
   - DO NOT add webpack config or try to disable Turbopack
   - The key is fixing the Tailwind content paths (see Phase 5)

## PHASE 3: CRITICAL SECURITY FIXES

6. Remove NODE_TLS_REJECT_UNAUTHORIZED from .env.local:
   - This is a CRITICAL security vulnerability
   - It disables SSL certificate validation
   - Remove the entire line: NODE_TLS_REJECT_UNAUTHORIZED=0

## PHASE 4: MIDDLEWARE/PROXY FIXES (MOST CRITICAL)

7. Rename src/middleware.ts to src/proxy.ts:
   - Next.js 16 deprecates middleware.ts naming convention

8. Remove NextAuth withAuth wrapper from proxy.ts:
   - REMOVE these imports and wrapper:
     ```typescript
     import { pagesOptions } from "@/app/api/auth/[...nextauth]/pages-options";
     import withAuth from "next-auth/middleware";
     
     export default withAuth({
       pages: {
         ...pagesOptions,
       },
     });
     ```
   
   - KEEP only:
     ```typescript
     import { NextResponse, NextRequest } from "next/server";
     import acceptLanguage from "accept-language";
     import { fallbackLng, languages } from "./app/i18n/settings";
     import { checkAndSaveRoles } from "./app/components/ui/storeRoles/allRoles/AllRolles";
     import { API_BASE_URL } from "./config/base-url";
     
     acceptLanguage.languages(languages);
     ```

9. At the END of proxy.ts file, add:
   ```typescript
   // Export middleware as default
   export default middleware;
   ```

10. Fix authentication logic with EXACT PATH MATCHING (SECURITY CRITICAL):
    - Replace substring matching with exact matching
    - Find this section in the middleware function and replace:
    
    OLD (VULNERABLE):
    ```typescript
    const isSigninPage = pathname.includes("/signin");
    const isPublicRoute = pathname.includes("/signin") || pathname.includes("/auth/");
    ```
    
    NEW (SECURE):
    ```typescript
    // Check API auth and manifest FIRST
    const isApiAuth = pathname.startsWith("/api/auth/");
    const isManifest = pathname === "/manifest.json";
    
    if (isApiAuth || isManifest) {
      return NextResponse.next();
    }

    // Redirect URLs without language prefix
    const hasLanguagePrefix = languages.some((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`);
    if (!hasLanguagePrefix && pathname !== "/") {
      const redirectUrl = new URL(`/${lang}${pathname}`, req.url);
      console.log(`🔄 Redirecting URL without language prefix: ${pathname} -> ${redirectUrl.pathname}`);
      return NextResponse.redirect(redirectUrl);
    }

    const refreshToken = req.cookies.get("refreshToken")?.value;

    // EXACT path matching for public routes
    const isSigninPage = pathname === `/${lang}/signin`;
    const isForgotPassword = pathname === `/${lang}/auth/forgot-password`;
    const isOtpPage = pathname === `/${lang}/auth/otp`;
    const isRestartPassword = pathname === `/${lang}/auth/restart-password`;
    
    const isPublicRoute = isSigninPage || isForgotPassword || isOtpPage || isRestartPassword;
    
    if (isPublicRoute) {
      console.log(`✅ Public route allowed: ${pathname}`);
      return NextResponse.next();
    }

    // Auth check with loop prevention
    if (!refreshToken) {
      console.log(`🔒 No refresh token, redirecting to signin. Path: ${pathname}`);
      const signinUrl = new URL(`/${lang}/signin`, req.url);
      // Prevent redirect loops from malformed URLs
      if (!pathname.includes('/signin/') && pathname !== `/${lang}/signin`) {
        signinUrl.searchParams.set('callbackUrl', pathname);
      }
      return NextResponse.redirect(signinUrl);
    }
    ```

11. Update ALL imports from @/middleware to @/proxy:
    - Search for: import { routeRoles } from "@/middleware"
    - Replace with: import { routeRoles } from "@/proxy"
    - Check files in: src/layouts/, src/app/

## PHASE 5: TURBOPACK TAILWIND CONFIG FIX (CRITICAL FOR MONOREPO)

12. Fix Tailwind config to use node_modules path instead of relative path:
    - File: apps/isomorphic-i18n/tailwind.config.ts
    - This is CRITICAL for Turbopack to work with monorepo packages

    OLD (CAUSES TURBOPACK PANIC):
    ```typescript
    const config: Pick<Config, "prefix" | "presets" | "content" | "theme"> = {
      content: [
        "./src/**/*.tsx",
        "./node_modules/rizzui/dist/*.{js,ts,jsx,tsx}",
        '../../packages/isomorphic-core/src/**/*.{js,ts,jsx,tsx}',  // ❌ Turbopack rejects
      ],
    ```

    NEW (TURBOPACK COMPATIBLE):
    ```typescript
    const config: Pick<Config, "prefix" | "presets" | "content" | "theme"> = {
      content: [
        "./src/**/*.tsx",
        "./node_modules/rizzui/dist/*.{js,ts,jsx,tsx}",
        // Reference core package via node_modules symlink for Turbopack compatibility
        "./node_modules/core/src/**/*.{js,ts,jsx,tsx}",  // ✅ Turbopack accepts
      ],
    ```

    **Why this fixes the error:**
    - Turbopack has security sandbox that blocks paths outside project root
    - `../../packages/isomorphic-core/src` is seen as "leaving filesystem root"
    - `./node_modules/core/src` points to same location via pnpm workspace symlink
    - Turbopack accepts node_modules paths as "within project"
    - Error: `FileSystemPath("isomorphic-intl").join("../../packages/isomorphic-core/src") leaves the filesystem root`

## PHASE 6: REACT 19 COMPATIBILITY FIXES

13. Remove useIsMounted() from client layouts:
    - In src/app/[lang]/(hydrogen)/layout.tsx
    
    OLD (CAUSES BLANK PAGES):
    ```typescript
    'use client';
    import { useIsMounted } from '@/hooks/use-is-mounted';
    
    export default function HydrogenLayout({ children, params }) {
      const isMounted = useIsMounted();
      
      if (!isMounted) return null; // ❌ CAUSES BLANK PAGES
      
      // ... rest
    }
    ```
    
    NEW (WORKS):
    ```typescript
    'use client';
    import React from 'react';
    
    export default function HydrogenLayout({ 
      children, 
      params 
    }: { 
      children: React.ReactNode; 
      params: Promise<{ lang: string }> 
    }) {
      const { lang } = React.use(params);
      
      // Direct render - no mount check
      return (
        <HydrogenProvider>
          {children}
        </HydrogenProvider>
      );
    }
    ```

## PHASE 7: BUILD & VERIFICATION

14. Clean build:
    - Remove-Item -Path "apps\isomorphic-i18n\.next" -Recurse -Force
    - Run: pnpm build
    - Expected: ✓ Compiled successfully, 0 TypeScript errors, all 101 routes compiled

15. Verify build output shows:
    - "ƒ Proxy (Middleware)" confirming middleware is active
    - No error messages
    - TypeScript compilation successful

## PHASE 8: SECURITY & AUTHENTICATION TESTING

16. Test authentication flow (CRITICAL):
    a) Clear browser cookies/localStorage completely
    
    b) Test protected route without auth:
       - URL: http://localhost:3004/ar/storeSetting/basicData
       - Expected: Redirect to /ar/signin?callbackUrl=/ar/storeSetting/basicData
       - ✅ MUST NOT show protected content
    
    c) Test malformed URL handling:
       - URL: http://localhost:3004/signin/storeSetting/basicData
       - Expected: Redirect to /ar/signin (no redirect loop)
       - ✅ MUST NOT cause infinite redirects
    
    d) Test public route access:
       - URL: http://localhost:3004/ar/signin
       - Expected: Signin page displays
       - ✅ MUST show signin form without auth
    
    e) Test language prefix addition:
       - URL: http://localhost:3004/storeSetting/basicData
       - Expected: Redirect to /ar/storeSetting/basicData
       - ✅ Language prefix added automatically
    
    f) Test login flow:
       - Login with valid credentials
       - Expected: Redirect to callback URL or dashboard
       - ✅ Protected routes accessible after login

17. Verify NO redirect loops on any URL pattern

18. Confirm security fixes applied:
    - ✅ NODE_TLS_REJECT_UNAUTHORIZED removed
    - ✅ Exact path matching (no substring matching)
    - ✅ NextAuth withAuth wrapper removed
    - ✅ Malformed URL protection active

## CRITICAL ISSUES YOU MUST FIX

### Issue 1: Turbopack Panic - FileSystemPath leaves filesystem root
CAUSE: Tailwind config using relative path `../../packages/isomorphic-core/src/**` to reference monorepo package
ERROR: `FileSystemPath("isomorphic-intl").join("../../packages/isomorphic-core/src") leaves the filesystem root`
SOLUTION: Change to `./node_modules/core/src/**` which uses pnpm workspace symlink
**This is THE most common Turbopack error in monorepo setups**

### Issue 2: ERR_TOO_MANY_REDIRECTS
CAUSE: NextAuth withAuth wrapper conflicts with Next.js 16
SOLUTION: Remove withAuth wrapper completely, use custom middleware

### Issue 3: Blank Dashboard/Pages
CAUSE: useIsMounted() returning false causes return null
SOLUTION: Remove useIsMounted() checks, use React.use(params) instead

### Issue 4: Authentication Bypass (SECURITY VULNERABILITY)
CAUSE: pathname.includes("/signin") matches /ar/signin/storeSetting/basicData
SOLUTION: Use exact matching: pathname === `/${lang}/signin`

### Issue 5: Redirect Loop on Malformed URLs
CAUSE: URLs like /signin/storeSetting/basicData create callback loops
SOLUTION: Check for '/signin/' in pathname before setting callbackUrl

### Issue 6: SSL Validation Disabled
CAUSE: NODE_TLS_REJECT_UNAUTHORIZED=0 in environment
SOLUTION: Remove this variable completely

## SUCCESS CRITERIA

After completing all steps, verify:
- [ ] Build completes with 0 errors
- [ ] All 101 routes compile successfully
- [ ] TypeScript shows 0 errors
- [ ] **Turbopack dev server starts without FATAL panic errors**
- [ ] **Development mode compiles pages successfully (GET /en 200)**
- [ ] Middleware shows as "ƒ Proxy (Middleware)"
- [ ] Protected routes require authentication
- [ ] Public routes work without authentication
- [ ] NO redirect loops on any URL
- [ ] Language prefix auto-added to URLs
- [ ] Login/logout flow works correctly
- [ ] Malformed URLs handled gracefully
- [ ] Build time: ~30s first build, <2s cached builds
- [ ] **No "leaves the filesystem root" errors from Turbopack**

## FILES YOU WILL MODIFY

1. package.json (root) - React overrides
2. apps/isomorphic-i18n/package.json - Dependencies
3. apps/isomorphic-i18n/next.config.mjs - Turbopack config
4. apps/isomorphic-i18n/.env.local - Remove security risk
5. src/middleware.ts → src/proxy.ts - Rename + fix auth
6. **apps/isomorphic-i18n/tailwind.config.ts** - Fix monorepo path for Turbopack
7. src/app/[lang]/(hydrogen)/layout.tsx - Remove useIsMounted
8. src/layouts/sticky-header.tsx - Remove useIsMounted
9. src/layouts/hydrogen/sidebar-menu.tsx - Update import (if exists)

## SECURITY IMPROVEMENTS APPLIED

1. Removed SSL certificate bypass (CVE fix)
2. Fixed authentication bypass vulnerability (exact path matching)
3. Patched CVE-2025-66478 (CVSS 10.0)
4. Patched CVE-2025-55184
5. Patched CVE-2025-55183
6. Removed redirect loop vulnerability
7. Added malformed URL protection

## PERFORMANCE GAINS EXPECTED

- First build: ~30 seconds (was ~1m 25s)
- Cached builds: <2 seconds (98%+ faster with Turbopack)
- Server start: <1 second
- Zero TypeScript errors

Execute all steps in order. After each phase, verify success before proceeding. Report any errors immediately with file paths and error messages. Do not skip any steps - they are all critical for a successful upgrade.
```

---

## Reference Documentation (For Context)

## Step 1: Upgrade Dependencies

### Root Package.json
Update React overrides to force consistent versions across monorepo:

```json
{
  "pnpm": {
    "overrides": {
      "react": "19.2.3",
      "react-dom": "19.2.3"
    }
  }
}
```

### Application Package.json
Update Next.js and React versions in `apps/isomorphic-i18n/package.json`:

```json
{
  "dependencies": {
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "eslint-config-next": "16.1.1"
  }
}
```

### Install Dependencies
```bash
pnpm install
```

## Step 2: Update Next.js Configuration

### Add Turbopack Configuration
In `next.config.mjs`, add Turbopack configuration:

```javascript
const nextConfig = {
  turbopack: {}, // Acknowledge Turbopack as default bundler
  // ... rest of your config
};
```

## Step 3: Security Fixes

### Remove Insecure Environment Variables
**CRITICAL**: Remove from `.env.local`:
```bash
# ❌ REMOVE THIS - Security Vulnerability
NODE_TLS_REJECT_UNAUTHORIZED=0
```

**Why**: This disables SSL certificate validation, creating a major security vulnerability.

**Alternative**: If you need to work with self-signed certificates in development, use proper SSL certificate configuration instead.

## Step 4: Middleware/Proxy File Fixes

### 4.1: Rename middleware.ts to proxy.ts
Next.js 16 deprecates `middleware.ts` naming convention. Rename:
```bash
# In src/ directory
mv middleware.ts proxy.ts
```

### 4.2: Remove NextAuth withAuth Wrapper
**CRITICAL FIX**: The NextAuth `withAuth` wrapper causes redirect loops in Next.js 16.

❌ **OLD CODE** (causes redirect loops):
```typescript
import withAuth from "next-auth/middleware";
import { pagesOptions } from "@/app/api/auth/[...nextauth]/pages-options";

export default withAuth({
  pages: {
    ...pagesOptions,
  },
});
```

✅ **NEW CODE** (works correctly):
```typescript
import { NextResponse, NextRequest } from "next/server";
import acceptLanguage from "accept-language";
import { fallbackLng, languages } from "./app/i18n/settings";
import { checkAndSaveRoles } from "./app/components/ui/storeRoles/allRoles/AllRolles";
import { API_BASE_URL } from "./config/base-url";

acceptLanguage.languages(languages);
```

At the end of the file, add:
```typescript
// Export middleware as default
export default middleware;
```

### 4.3: Fix Authentication Logic with Exact Path Matching
**SECURITY VULNERABILITY FIX**: Using substring matching allows authentication bypass.

❌ **VULNERABLE CODE**:
```typescript
const isSigninPage = pathname.includes("/signin"); // Matches /ar/signin/storeSetting/basicData
const isPublicRoute = pathname.includes("/signin") || pathname.includes("/auth/");
```

✅ **SECURE CODE** (exact path matching):
```typescript
// Check if route is a public auth route FIRST (before language redirect)
const isApiAuth = pathname.startsWith("/api/auth/");
const isManifest = pathname === "/manifest.json";

if (isApiAuth || isManifest) {
  return NextResponse.next();
}

// Redirect URLs without language prefix to include language
const hasLanguagePrefix = languages.some((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`);
if (!hasLanguagePrefix && pathname !== "/") {
  const redirectUrl = new URL(`/${lang}${pathname}`, req.url);
  console.log(`🔄 Redirecting URL without language prefix: ${pathname} -> ${redirectUrl.pathname}`);
  return NextResponse.redirect(redirectUrl);
}

const refreshToken = req.cookies.get("refreshToken")?.value;

// Check if route is a public auth route (EXACT match only with language prefix)
const isSigninPage = pathname === `/${lang}/signin`;
const isForgotPassword = pathname === `/${lang}/auth/forgot-password`;
const isOtpPage = pathname === `/${lang}/auth/otp`;
const isRestartPassword = pathname === `/${lang}/auth/restart-password`;

const isPublicRoute = isSigninPage || isForgotPassword || isOtpPage || isRestartPassword;

if (isPublicRoute) {
  console.log(`✅ Public route allowed: ${pathname}`);
  return NextResponse.next();
}

// Auth check - redirect to signin if no refresh token
if (!refreshToken) {
  console.log(`🔒 No refresh token, redirecting to signin. Path: ${pathname}`);
  const signinUrl = new URL(`/${lang}/signin`, req.url);
  // Only set callbackUrl if it's a valid protected route (not a malformed URL)
  if (!pathname.includes('/signin/') && pathname !== `/${lang}/signin`) {
    signinUrl.searchParams.set('callbackUrl', pathname);
  }
  return NextResponse.redirect(signinUrl);
}
```

### 4.4: Update Imports in Other Files
Update any files importing from `@/middleware` to `@/proxy`:

```typescript
// In layouts/hydrogen/sidebar-menu.tsx and other files
import { routeRoles } from "@/proxy"; // was @/middleware
```

## Step 5: Fix React 19 Client Component Issues

### Remove useIsMounted() Hook from Layouts
React 19 handles hydration better. Remove unnecessary mount checks that cause blank pages.

❌ **CAUSES BLANK PAGES**:
```typescript
// In app/[lang]/(hydrogen)/layout.tsx
'use client';
import { useIsMounted } from '@/hooks/use-is-mounted';

export default function HydrogenLayout({ children, params }) {
  const isMounted = useIsMounted();
  
  if (!isMounted) return null; // ❌ This causes blank pages
  
  // ... rest of code
}
```

✅ **WORKS CORRECTLY**:
```typescript
'use client';
import React from 'react';

export default function HydrogenLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode; 
  params: Promise<{ lang: string }> 
}) {
  const { lang } = React.use(params); // React 19 way to handle async params
  
  // Direct render - no mount check needed
  return (
    <HydrogenProvider>
      {children}
    </HydrogenProvider>
  );
}
```

## Step 6: Build and Test

### Clean Build
```bash
# Remove old build artifacts
Remove-Item -Path "apps\isomorphic-i18n\.next" -Recurse -Force

# Build the application
pnpm build
```

### Expected Build Output
```
✓ Compiled successfully in ~30s
✓ Finished TypeScript in ~10s
✓ Collecting page data
✓ Generating static pages (101/101)

ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

## Step 7: Security & Authentication Testing

### Test Authentication Flow
1. **Clear browser cookies and localStorage**
2. **Test protected route access**:
   - Go to: `http://localhost:3004/ar/storeSetting/basicData` (without login)
   - Expected: Redirect to `http://localhost:3004/ar/signin?callbackUrl=/ar/storeSetting/basicData`
   - ✅ Should NOT show protected content

3. **Test malformed URL protection**:
   - Try: `http://localhost:3004/signin/storeSetting/basicData`
   - Expected: Redirect to `http://localhost:3004/ar/signin` (language prefix added, malformed path rejected)
   - ✅ Should NOT cause redirect loop

4. **Test public routes**:
   - Access: `http://localhost:3004/ar/signin`
   - Expected: Signin page loads without authentication
   - ✅ Should display signin form

5. **Test login flow**:
   - Login with valid credentials
   - Expected: Redirect to callback URL or dashboard
   - ✅ Should access protected routes after login

6. **Test language handling**:
   - Access: `http://localhost:3004/storeSetting/basicData` (no language prefix)
   - Expected: Redirect to `http://localhost:3004/ar/storeSetting/basicData`
   - ✅ Language prefix should be added automatically

### Security Checklist
- [ ] Unauthenticated users CANNOT access protected routes
- [ ] No redirect loops on any URL
- [ ] Public routes (signin, forgot-password, otp) accessible without authentication
- [ ] Malformed URLs handled gracefully
- [ ] Language prefix added automatically to URLs missing it
- [ ] SSL certificate validation enabled (NODE_TLS_REJECT_UNAUTHORIZED removed)
- [ ] Exact path matching prevents authentication bypass

## Step 8: Performance Verification

### Build Performance
- **First build**: ~1m 20s
- **Cached builds**: ~1-2s (98%+ faster with Turbopack)

### Runtime Performance
- **Server start time**: <1s
- **Route compilation**: All 101 routes compiled successfully
- **TypeScript**: 0 errors expected

## Common Issues & Solutions

### Issue 1: ERR_TOO_MANY_REDIRECTS
**Cause**: NextAuth `withAuth` wrapper interfering with custom middleware logic.

**Solution**: Remove `withAuth` wrapper, implement custom authentication in middleware function.

### Issue 2: Blank Dashboard/Pages
**Cause**: `useIsMounted()` hook returning false causes `return null` in layouts.

**Solution**: Remove `useIsMounted()` checks in client layouts, use `React.use(params)` for async params.

### Issue 3: Authentication Bypass (SECURITY)
**Cause**: Substring matching (`pathname.includes("/signin")`) allows URLs like `/ar/signin/storeSetting/basicData` to bypass auth.

**Solution**: Use exact path matching (`pathname === \`/${lang}/signin\``).

### Issue 4: Language Prefix Missing
**Cause**: Users accessing URLs without language prefix like `/signin/storeSetting/basicData`.

**Solution**: Detect and redirect URLs without language prefix in middleware:
```typescript
const hasLanguagePrefix = languages.some((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`);
if (!hasLanguagePrefix && pathname !== "/") {
  return NextResponse.redirect(new URL(`/${lang}${pathname}`, req.url));
}
```

### Issue 5: NODE_TLS_REJECT_UNAUTHORIZED Warning
**Cause**: Development environment variable disabling SSL verification.

**Solution**: Remove `NODE_TLS_REJECT_UNAUTHORIZED=0` from `.env.local`. Use proper SSL certificates or configure API client to handle self-signed certificates properly.

## Security Improvements Applied

1. ✅ **Removed SSL bypass** - All HTTPS connections now properly validated
2. ✅ **Fixed authentication bypass** - Exact path matching prevents URL manipulation
3. ✅ **Patched CVEs**:
   - CVE-2025-66478 (CVSS 10.0) - Critical security vulnerability
   - CVE-2025-55184 - Server-side security issue
   - CVE-2025-55183 - Authentication vulnerability
4. ✅ **Removed NextAuth wrapper** - Eliminates redirect loop vulnerability
5. ✅ **Added malformed URL protection** - Prevents infinite redirects

## Breaking Changes from Next.js 15 to 16

1. **Turbopack is now default bundler** - Requires all paths to be within project root
2. **Turbopack monorepo paths** - Must use `./node_modules/package/src/**` instead of `../../packages/package/src/**`
3. **Middleware naming convention** - `middleware.ts` should be renamed to custom name like `proxy.ts`
4. **React 19 compatibility** - `useIsMounted()` patterns no longer needed
5. **NextAuth middleware wrapper** - Causes issues in Next.js 16, use custom implementation
6. **Stricter path matching** - Route matching must be exact to prevent security issues

## Post-Upgrade Checklist

- [ ] All dependencies upgraded to latest versions
- [ ] **Tailwind config updated to use node_modules paths (CRITICAL)**
- [ ] Insecure environment variables removed
- [ ] Middleware renamed and NextAuth wrapper removed
- [ ] Authentication logic uses exact path matching
- [ ] All imports updated from @/middleware to @/proxy
- [ ] useIsMounted() removed from client layouts
- [ ] **Turbopack dev server starts without FATAL errors**
- [ ] Build completes successfully with 0 errors
- [ ] All routes compile correctly (dev and production)
- [ ] Protected routes require authentication
- [ ] Public routes accessible without auth
- [ ] No redirect loops on any URL
- [ ] Language prefix automatically added to URLs
- [ ] Login/logout flow works correctly
- [ ] Performance improvements verified (faster builds with Turbopack)

## Rollback Plan

If issues occur after upgrade:

1. **Restore from git**:
   ```bash
   git reset --hard HEAD~[number-of-commits]
   ```

2. **Reinstall previous dependencies**:
   ```bash
   pnpm install
   ```

3. **Clear Next.js cache**:
   ```bash
   Remove-Item -Path "apps\isomorphic-i18n\.next" -Recurse -Force
   ```

4. **Rebuild**:
   ```bash
   pnpm build
   ```

## Final Notes

- **Total upgrade time**: ~2-3 hours including testing
- **Critical fixes applied**: 6 major issues resolved
- **Security improvements**: 5 vulnerabilities patched
- **Performance gain**: 98%+ faster cached builds with Turbopack
- **Zero errors**: TypeScript, build, and runtime all passing

## Quick Reference: Key Files Modified

1. `package.json` (root) - React overrides
2. `apps/isomorphic-i18n/package.json` - Next.js 16.1.1, React 19.2.3
3. `apps/isomorphic-i18n/next.config.mjs` - Turbopack config
4. `apps/isomorphic-i18n/.env.local` - Removed NODE_TLS_REJECT_UNAUTHORIZED
5. `src/middleware.ts` → `src/proxy.ts` - Renamed, removed withAuth wrapper, fixed auth logic
6. `src/app/[lang]/(hydrogen)/layout.tsx` - Removed useIsMounted()
7. `src/layouts/hydrogen/sidebar-menu.tsx` - Updated import path

## AI Agent Prompt for Future Upgrades

```
Upgrade my Next.js application from version [CURRENT] to [TARGET] following these steps:

1. Update dependencies in root and app package.json files
2. Add Turbopack configuration to next.config.mjs
3. Remove any insecure environment variables (NODE_TLS_REJECT_UNAUTHORIZED)
4. Rename middleware.ts to proxy.ts
5. Remove NextAuth withAuth wrapper from proxy.ts
6. Fix authentication logic to use exact path matching (not substring matching)
7. Add language prefix redirect logic for URLs without language
8. Update all imports from @/middleware to @/proxy
9. Remove useIsMounted() hooks from client layouts
10. Clean build and verify all routes compile
11. Test authentication flow thoroughly:
    - Protected routes require login
    - Public routes accessible without auth
    - No redirect loops
    - Malformed URLs handled gracefully
12. Verify security improvements and performance gains

Critical requirements:
- **FIX TAILWIND CONFIG FIRST** - Change `../../packages/` to `./node_modules/` paths
- Use exact path matching for auth routes (security)
- Remove NextAuth withAuth wrapper (prevents redirect loops)
- Test with cleared cookies (authentication validation)
- Verify no authentication bypass vulnerabilities
```

---

## 🎯 KEY TAKEAWAY: The Turbopack Monorepo Fix

**If you're upgrading a monorepo to Next.js 16 and getting Turbopack FATAL errors**, the issue is almost always in your Tailwind config or any other file that references packages outside the project root using relative paths like `../../packages/`.

**The Solution:**
- ❌ `../../packages/isomorphic-core/src/**`
- ✅ `./node_modules/core/src/**`

Both paths point to the same location (via pnpm workspace symlink), but Turbopack only accepts the second one because it's "within" the project from its security sandbox perspective.

This fix applies to:
- `tailwind.config.ts` content paths
- Any import paths in configuration files
- PostCSS configs referencing external packages

**This is THE most common Next.js 16 Turbopack issue and is poorly documented.** Save yourself hours of debugging by fixing this first!
```
