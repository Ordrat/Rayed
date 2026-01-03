# Authentication System Implementation

This document describes the authentication system implemented for the seller application.

## Overview

The authentication system integrates with the backend API (https://api.rayed.app) and implements the following flow:

1. Support creates seller account (via backend)
2. Seller logs in with credentials provided by support
3. On first login, seller is automatically redirected to reset password
4. After resetting password, seller gains full access to the application

## Architecture

### Key Components

1. **API Client** (`src/lib/api-client.ts`)
   - Generic HTTP client for making API requests
   - Handles authentication headers, error handling, and response parsing

2. **Auth Service** (`src/services/auth.service.ts`)
   - `sellerLogin()` - Login with email/phone and password
   - `resetPassword()` - Reset password with token
   - `logout()` - Logout and invalidate session

3. **NextAuth Configuration** (`src/auth.ts`)
   - JWT-based session management
   - Custom session callbacks to store user data and tokens
   - Integration with backend login API

4. **Type Definitions** (`src/types/auth.types.ts`)
   - TypeScript interfaces for API requests/responses
   - SellerStatus enum for user states

## Authentication Flow

### 1. Support Creates Seller Account

Support staff creates a seller account through the backend system. When creating an account, support should provide:
- Email or phone number
- Temporary password
- Reset token (for first-time password reset)

These credentials are then provided to the seller.

### 2. Seller First Login

**Form:** `src/app/[locale]/auth/(sign-in)/sign-in-1/sign-in-form.tsx`

1. Seller enters email/phone and password
2. System calls `/api/Auth/SellerLogin` endpoint
3. Backend returns user data including `sellerStatus` field
4. If `sellerStatus === 0`, user needs password reset
5. Session is created with `needsPasswordReset: true`
6. User is automatically redirected to reset password page

**Key Code:**
```typescript
// Check if seller needs to reset password
const needsReset = needsPasswordReset(response.sellerStatus);

// Auto-redirect if password reset needed
if (status === "authenticated" && session?.user?.needsPasswordReset) {
  router.push(routes.auth.forgotPassword1);
}
```

### 3. Password Reset

**Form:** `src/app/[locale]/auth/(forgot-password)/forgot-password-1/forget-password-form.tsx`

1. Email/phone is pre-filled from session
2. Seller enters:
   - Reset token (provided by support)
   - New password
   - Confirm password
3. System calls `/api/Auth/ResetPassword` endpoint
4. Session is updated with new tokens
5. User is redirected to dashboard

### 4. Logout

**Component:** `src/layouts/profile-menu.tsx`

1. User clicks logout button
2. System calls `/api/Auth/Logout` endpoint with access token
3. Local session is cleared via NextAuth `signOut()`
4. User is redirected to login page

## API Endpoints

### Seller Login
```
POST /api/Auth/SellerLogin
Headers:
  - X-Api-Version: 1.0
  - Accept-Language: en
Body:
  {
    "emailOrPhone": "string",
    "password": "string"
  }
Response:
  {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "sellerStatus": 0, // 0 = needs password reset
    "accessToken": "string",
    "refreshToken": "string",
    ...
  }
```

### Reset Password
```
POST /api/Auth/ResetPassword
Headers:
  - X-Api-Version: 1.0
  - Accept-Language: en
Body:
  {
    "phoneNumberOrEmail": "string",
    "resetToken": "string",
    "newPassword": "string",
    "confirmPassword": "string"
  }
Response:
  {
    "id": "uuid",
    "email": "string",
    "accessToken": "string",
    "refreshToken": "string",
    ...
  }
```

### Logout
```
POST /api/Auth/Logout
Headers:
  - X-Api-Version: 1.0
  - Accept-Language: en
  - Authorization: Bearer {accessToken}
```

## Session Management

### Token Storage

Tokens are stored in NextAuth JWT session (HTTP-only cookies via NextAuth):
- `accessToken` - Used for API authentication
- `refreshToken` - Used for refreshing access token
- `accessTokenExpiration` - Token expiration timestamp
- `refreshTokenExpiration` - Refresh token expiration

### Session Data

The session contains:
```typescript
{
  user: {
    id: string
    email: string
    name: string
    firstName: string
    lastName: string
    phoneNumber: string
    roles: string[]
    shopId: string
    needsPasswordReset: boolean
    sellerStatus: number
  }
  accessToken: string
  refreshToken: string
  accessTokenExpiration: string
}
```

### Accessing Session

In client components:
```typescript
import { useSession } from "next-auth/react";

const { data: session } = useSession();
const accessToken = session?.accessToken;
```

In server components/API routes:
```typescript
import { getServerSession } from "next-auth";
import auth from "@/auth";

const session = await getServerSession(auth);
```

## Environment Variables

Required environment variables in `.env.local`:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3001

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.rayed.app
```

## Validation Schemas

### Login Schema
```typescript
{
  emailOrPhone: string (required)
  password: string (required)
  rememberMe: boolean (optional)
}
```

### Reset Password Schema
```typescript
{
  phoneNumberOrEmail: string (required)
  resetToken: string (required)
  newPassword: string (required, validated)
  confirmPassword: string (required, must match newPassword)
}
```

## Protected Routes

The middleware (`src/middleware.ts`) protects all routes except:
- `/auth/sign-in-1`
- `/auth/sign-up-1`
- `/auth/otp-1`
- `/auth/forgot-password-1`

Unauthenticated users are redirected to `/auth/sign-in-1`.

## Error Handling

### API Errors
- Network errors are caught and displayed as toast notifications
- API error responses include details from the backend
- Authentication failures redirect to login page

### Client-Side Validation
- Form validation using Zod schemas
- Real-time validation on input change
- Clear error messages displayed inline

## Testing the Flow

### As Support (Backend)
1. Create seller account via backend API
2. Generate and save reset token
3. Provide to seller:
   - Email/phone
   - Temporary password
   - Reset token

### As Seller
1. Navigate to login page (`/auth/sign-in-1`)
2. Enter credentials provided by support
3. Click "Sign in"
4. Auto-redirected to reset password page
5. Enter reset token and new password
6. Submit to complete setup
7. Redirected to dashboard

## Future Enhancements

Potential improvements:
- Token refresh mechanism before expiration
- "Remember me" functionality with longer sessions
- Multi-factor authentication
- Password strength indicator
- Email/SMS verification
- Forgot password flow for existing users
- Social login integration

## Troubleshooting

### Login fails with "Invalid credentials"
- Verify credentials are correct
- Check API endpoint is accessible
- Check network connectivity

### Not redirected after login
- Check browser console for errors
- Verify session is created (check NextAuth debug logs)
- Check middleware configuration

### Reset password fails
- Verify reset token is valid
- Check password meets requirements
- Verify API endpoint is accessible

### Session lost on refresh
- Check NEXTAUTH_SECRET is set
- Verify cookies are enabled
- Check NEXTAUTH_URL matches your domain
