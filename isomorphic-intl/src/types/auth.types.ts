/**
 * Authentication types based on the API documentation
 */

export interface SellerLoginRequest {
  emailOrPhone: string;
  password: string;
}

export interface SellerLoginResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailConfirmed: boolean;
  isActive: boolean;
  sellerStatus: number;
  roles: string[];
  shopId: string;
  accessToken: string;
  accessTokenExpirationDate: string;
  refreshToken: string;
  refreshTokenExpirationDate: string;
}

export interface ResetPasswordRequest {
  phoneNumberOrEmail: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailConfirmed: boolean;
  isActive: boolean;
  roles: string[];
  accessToken: string;
  accessTokenExpirationDate: string;
  refreshToken: string;
  refreshTokenExpirationDate: string;
}

export interface ApiErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  [key: string]: any;
}

/**
 * Seller status enum based on API
 * 0 = Pending approval (new account, not yet approved by admin)
 * 1 = Active (approved by admin)
 * 2 = Suspended
 */
export enum SellerStatus {
  PENDING = 0,
  ACTIVE = 1,
  SUSPENDED = 2,
}

// ============ OTP Verification Types ============

export interface VerifyAccountRequest {
  phoneNumberOrEmail: string;
  verificationCode: string;
}

export interface VerifyAccountResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailConfirmed: boolean;
  isActive: boolean;
  roles: string[];
  accessToken: string;
  accessTokenExpirationDate: string;
  refreshToken: string;
  refreshTokenExpirationDate: string;
}

export interface ResendVerificationCodeRequest {
  email?: string;
  phoneNumber?: string;
}

// ============ Forgot Password Types ============

export interface ForgotPasswordRequest {
  email?: string;
  phoneNumber?: string;
}

export interface VerifyResetCodeRequest {
  phoneNumberOrEmail: string;
  resetCode: string;
}

export interface RegisterSellerRequest {
  firstName: string;
  lastName?: string;
  phoneNumber: string;
  email: string;
  password: string;
  bankAccountNumber?: string;
  bankName?: string;
}

export interface RegisterSellerResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  accountStatus: number;
  verifiedAt?: string;
  createdAt: string;
}
