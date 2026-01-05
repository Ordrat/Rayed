// Seller Types based on API specification

export interface Seller {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  accountStatus: SellerAccountStatus;
  totalEarnings: number;
  commissionRate: number;
  bankAccountNumber: string;
  bankName: string;
  verifiedAt: string | null;
  createdAt: string;
}

export interface RegisterSellerRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  bankAccountNumber: string;
  bankName: string;
}

export interface UpdateSellerRequest {
  sellerId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  bankAccountNumber: string;
  bankName: string;
}

export interface ChangeSellerAccountStatusRequest {
  sellerId: string;
  accountStatus: SellerAccountStatus;
}

export interface SellerDocument {
  id: string;
  sellerId: string;
  documentType: SellerDocumentType;
  documentUrl: string;
  verificationStatus: DocumentVerificationStatus;
  rejectionReason: string | null;
  expiresAt: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeSellerDocumentStatusRequest {
  documentId: string;
  verificationStatus: DocumentVerificationStatus;
  rejectionReason?: string;
}

// Enums
export enum SellerAccountStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
  SUSPENDED = 3,
}

export enum SellerDocumentType {
  NATIONAL_ID = 0,
  COMMERCIAL_REGISTER = 1,
  TAX_CERTIFICATE = 2,
  BANK_STATEMENT = 3,
}

export enum DocumentVerificationStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
}

// Helper functions
export function getSellerAccountStatusLabel(status: SellerAccountStatus): string {
  switch (status) {
    case SellerAccountStatus.PENDING:
      return "Pending";
    case SellerAccountStatus.APPROVED:
      return "Approved";
    case SellerAccountStatus.REJECTED:
      return "Rejected";
    case SellerAccountStatus.SUSPENDED:
      return "Suspended";
    default:
      return "Unknown";
  }
}

export function getSellerDocumentTypeLabel(type: SellerDocumentType): string {
  switch (type) {
    case SellerDocumentType.NATIONAL_ID:
      return "National ID";
    case SellerDocumentType.COMMERCIAL_REGISTER:
      return "Commercial Register";
    case SellerDocumentType.TAX_CERTIFICATE:
      return "Tax Certificate";
    case SellerDocumentType.BANK_STATEMENT:
      return "Bank Statement";
    default:
      return "Unknown";
  }
}

export function getDocumentVerificationStatusLabel(status: DocumentVerificationStatus): string {
  switch (status) {
    case DocumentVerificationStatus.PENDING:
      return "Pending";
    case DocumentVerificationStatus.APPROVED:
      return "Approved";
    case DocumentVerificationStatus.REJECTED:
      return "Rejected";
    default:
      return "Unknown";
  }
}
