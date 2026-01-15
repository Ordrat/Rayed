// Branch Types based on API specification

export interface Branch {
  id: string;
  shopId: string;
  nameEn: string;
  nameAr: string;
  phoneNumber: string;
  fullAddress: string;
  buildingNumber: string;
  street: string;
  district: string;
  city: string;
  governorate: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  isOpen: boolean;
  displayOrder: number;
  cityId: string;
  status: BranchStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChangeBranchStatusRequest {
  id: string;
  status: BranchStatus;
}

export interface GetBranchesParams {
  shopId?: string;
  cityId?: string;
  status?: BranchStatus;
  isActive?: boolean;
  isOpen?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

// Enums
export enum BranchStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
}

// Helper functions
export function getBranchStatusLabel(status: BranchStatus): string {
  switch (status) {
    case BranchStatus.PENDING:
      return 'Pending';
    case BranchStatus.APPROVED:
      return 'Approved';
    case BranchStatus.REJECTED:
      return 'Rejected';
    default:
      return 'Unknown';
  }
}

export function getBranchName(branch: Branch, locale: string): string {
  return locale === 'ar' ? branch.nameAr : branch.nameEn;
}
