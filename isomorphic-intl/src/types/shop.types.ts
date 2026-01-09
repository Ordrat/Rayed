/**
 * Shop types for handling shop-related data
 */

// Shop status enum matching backend
export enum ShopStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
  SUSPENDED = 3,
}

// Helper to get status label
export function getShopStatusLabel(status: ShopStatus): string {
  switch (status) {
    case ShopStatus.PENDING:
      return 'Pending';
    case ShopStatus.APPROVED:
      return 'Approved';
    case ShopStatus.REJECTED:
      return 'Rejected';
    case ShopStatus.SUSPENDED:
      return 'Suspended';
    default:
      return 'Unknown';
  }
}

// SubCategory interface
export interface SubCategory {
  id: string;
  shopCategoryId: string;
  name: string;
  iconUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

// Shop interface
export interface Shop {
  id: string;
  sellerId: string;
  shopCategoryId: string;
  name: string;
  description: string;
  logoUrl: string;
  backgroundImageUrl: string;
  status: ShopStatus;
  isFeatured: boolean;
  averageRating: number;
  totalOrders: number;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
  subCategories: SubCategory[];
}

// ShopCategory interface
export interface ShopCategory {
  id: string;
  name: string;
  iconUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

// Request types
export interface ChangeShopStatusRequest {
  shopId: string;
  status: ShopStatus;
}

export interface CreateShopCategoryRequest {
  nameEn: string;
  nameAr: string;
  icon?: File;
  displayOrder: number;
  isActive: boolean;
}

export interface UpdateShopCategoryRequest {
  nameEn: string;
  nameAr: string;
  icon?: File;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateSubCategoryRequest {
  shopCategoryId: string;
  nameEn: string;
  nameAr: string;
  icon?: File;
  displayOrder: number;
  isActive: boolean;
}

export interface UpdateSubCategoryRequest {
  nameEn: string;
  nameAr: string;
  icon?: File;
  displayOrder: number;
  isActive: boolean;
}
