// Product Types based on API specification

export interface Product {
  id: string;
  shopId: string;
  shopName: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  basePrice: number;
  discountedPrice: number;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  averageRating: number;
  totalOrders: number;
  status: ProductStatus;
  approvedByUserName: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  productImages: ProductImage[];
  variations: ProductVariation[];
  tags: ProductTag[];
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductVariation {
  id: string;
  nameAr: string;
  nameEn: string;
  buttonType: number;
  isActive: boolean;
  isRequired: boolean;
  priority: number;
  choices: ProductVariationChoice[];
}

export interface ProductVariationChoice {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  imageUrl: string | null;
  isDefault: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface ProductTag {
  id: string;
  name: string;
  icon: string | null;
  colorCode: string | null;
}

// Enums
export enum ProductStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
}

// Helper functions
export function getProductStatusLabel(status: ProductStatus): string {
  switch (status) {
    case ProductStatus.PENDING:
      return "Pending";
    case ProductStatus.APPROVED:
      return "Approved";
    case ProductStatus.REJECTED:
      return "Rejected";
    default:
      return "Unknown";
  }
}

export function getProductStatusBadgeColor(status: ProductStatus): "warning" | "success" | "danger" | "secondary" {
  switch (status) {
    case ProductStatus.APPROVED:
      return "success";
    case ProductStatus.PENDING:
      return "warning";
    case ProductStatus.REJECTED:
      return "danger";
    default:
      return "secondary";
  }
}
