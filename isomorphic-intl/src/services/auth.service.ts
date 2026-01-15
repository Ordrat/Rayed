import { apiRequest } from "@/lib/api-client";
import {
  SellerLoginRequest,
  SellerLoginResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  SellerStatus,
  VerifyAccountRequest,
  VerifyAccountResponse,
  ResendVerificationCodeRequest,
  ForgotPasswordRequest,
  VerifyResetCodeRequest,
  RegisterSellerRequest,
  RegisterSellerResponse,
} from "@/types/auth.types";

/**
 * Login seller with email/phone and password
 */
export async function sellerLogin(credentials: SellerLoginRequest): Promise<SellerLoginResponse> {
  return apiRequest<SellerLoginResponse>("/api/Auth/SellerLogin", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

/**
 * Register a new seller
 */
export async function registerSeller(data: RegisterSellerRequest): Promise<RegisterSellerResponse> {
  return apiRequest<RegisterSellerResponse>("/api/Seller/RegisterSeller", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Reset seller password (forgot password flow with token)
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  return apiRequest<ResetPasswordResponse>("/api/Auth/ResetPassword", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Change password (for authenticated users, e.g., first-time login)
 */
export async function changePassword(data: ChangePasswordRequest, token: string): Promise<void> {
  return apiRequest<void>("/api/Auth/ChangePassword", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Logout seller
 */
export async function logout(token: string): Promise<void> {
  return apiRequest<void>("/api/Auth/Logout", {
    method: "POST",
    token,
  });
}

/**
 * Check if seller account is active (approved by admin)
 */
export function isSellerActive(sellerStatus: number): boolean {
  return sellerStatus === SellerStatus.ACTIVE;
}

/**
 * Store auth tokens in HTTP-only cookies (to be called from API route)
 */
export function createAuthTokens(response: SellerLoginResponse | ResetPasswordResponse | VerifyAccountResponse) {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    accessTokenExpiration: response.accessTokenExpirationDate,
    refreshTokenExpiration: response.refreshTokenExpirationDate,
  };
}

// ============ OTP Verification ============

/**
 * Verify account with OTP code sent to email/phone
 */
export async function verifyAccount(data: VerifyAccountRequest): Promise<VerifyAccountResponse> {
  return apiRequest<VerifyAccountResponse>("/api/Auth/VerifyAccount", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Resend verification code to email or phone
 */
export async function resendVerificationCode(data: ResendVerificationCodeRequest): Promise<string> {
  return apiRequest<string>("/api/Auth/ResendVerificationCode", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============ Forgot Password ============

/**
 * Request password reset - sends code to email/phone
 */
export async function forgotPassword(data: ForgotPasswordRequest): Promise<string> {
  return apiRequest<string>("/api/Auth/ForgotPassword", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Verify reset code before allowing password reset
 */
export async function verifyResetCode(data: VerifyResetCodeRequest): Promise<string> {
  return apiRequest<string>("/api/Auth/VerifyResetCode", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
