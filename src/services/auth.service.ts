import { apiRequest } from '@/lib/api-client';
import {
  SellerLoginRequest,
  SellerLoginResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  SellerStatus,
} from '@/types/auth.types';

/**
 * Login seller with email/phone and password
 */
export async function sellerLogin(
  credentials: SellerLoginRequest
): Promise<SellerLoginResponse> {
  return apiRequest<SellerLoginResponse>('/api/Auth/SellerLogin', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

/**
 * Reset seller password (forgot password flow with token)
 */
export async function resetPassword(
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  return apiRequest<ResetPasswordResponse>('/api/Auth/ResetPassword', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Change password (for authenticated users, e.g., first-time login)
 */
export async function changePassword(
  data: ChangePasswordRequest,
  token: string
): Promise<void> {
  return apiRequest<void>('/api/Auth/ChangePassword', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Logout seller
 */
export async function logout(token: string): Promise<void> {
  return apiRequest<void>('/api/Auth/Logout', {
    method: 'POST',
    token,
  });
}

/**
 * Check if seller needs to reset password (first time login)
 */
export function needsPasswordReset(sellerStatus: number): boolean {
  return sellerStatus === SellerStatus.NEEDS_PASSWORD_RESET;
}

/**
 * Store auth tokens in HTTP-only cookies (to be called from API route)
 */
export function createAuthTokens(response: SellerLoginResponse | ResetPasswordResponse) {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    accessTokenExpiration: response.accessTokenExpirationDate,
    refreshTokenExpiration: response.refreshTokenExpirationDate,
  };
}
