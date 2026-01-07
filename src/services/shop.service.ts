/**
 * Shop service for handling all shop-related API calls
 */

import { apiRequest } from '@/lib/api-client';
import {
  Shop,
  ShopCategory,
  SubCategory,
  ChangeShopStatusRequest,
} from '@/types/shop.types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.rayed.app';

/**
 * Get full URL for an image path
 * If the iconUrl is already a full URL, return it as is
 * Otherwise, prepend the API base URL
 */
export function getImageUrl(iconUrl: string | null | undefined): string | null {
  if (!iconUrl) return null;
  
  // If already a full URL, return as is
  if (iconUrl.startsWith('http://') || iconUrl.startsWith('https://')) {
    return iconUrl;
  }
  
  // Prepend API base URL
  return `${API_BASE}${iconUrl.startsWith('/') ? '' : '/'}${iconUrl}`;
}

// =====================
// Shop APIs
// =====================

/**
 * Get all shops (admin)
 */
export async function getAllShops(token: string): Promise<Shop[]> {
  return apiRequest<Shop[]>('/api/Shop/GetAll', {
    method: 'GET',
    token,
  });
}

/**
 * Change shop status (approve/reject)
 */
export async function changeShopStatus(
  data: ChangeShopStatusRequest,
  token: string
): Promise<void> {
  return apiRequest<void>('/api/Shop/ChangeStatus/change-status', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

// =====================
// ShopCategory APIs
// =====================

/**
 * Create a shop category (multipart/form-data)
 */
export async function createShopCategory(
  formData: FormData,
  token: string
): Promise<ShopCategory> {
  const response = await fetch(`${API_BASE}/api/ShopCategory/Create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.title || 'Failed to create shop category');
  }

  return response.json();
}

/**
 * Update a shop category (multipart/form-data)
 */
export async function updateShopCategory(
  id: string,
  formData: FormData,
  token: string
): Promise<ShopCategory> {
  const response = await fetch(`${API_BASE}/api/ShopCategory/Update/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.title || 'Failed to update shop category');
  }

  return response.json();
}

/**
 * Get a shop category by ID
 */
export async function getShopCategoryById(
  id: string,
  token: string
): Promise<ShopCategory> {
  return apiRequest<ShopCategory>(`/api/ShopCategory/GetById/${id}`, {
    method: 'GET',
    token,
  });
}

/**
 * Get all shop categories
 */
export async function getAllShopCategories(token: string): Promise<ShopCategory[]> {
  return apiRequest<ShopCategory[]>('/api/ShopCategory/GetAll', {
    method: 'GET',
    token,
  });
}

/**
 * Delete a shop category
 */
export async function deleteShopCategory(id: string, token: string): Promise<void> {
  return apiRequest<void>(`/api/ShopCategory/Delete/${id}`, {
    method: 'DELETE',
    token,
  });
}

// =====================
// SubCategory APIs
// =====================

/**
 * Create a subcategory (multipart/form-data)
 */
export async function createSubCategory(
  formData: FormData,
  token: string
): Promise<SubCategory> {
  const response = await fetch(`${API_BASE}/api/SubCategory/Create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.title || 'Failed to create subcategory');
  }

  return response.json();
}

/**
 * Update a subcategory (multipart/form-data)
 */
export async function updateSubCategory(
  id: string,
  formData: FormData,
  token: string
): Promise<SubCategory> {
  const response = await fetch(`${API_BASE}/api/SubCategory/Update/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.title || 'Failed to update subcategory');
  }

  return response.json();
}

/**
 * Get a subcategory by ID
 */
export async function getSubCategoryById(
  id: string,
  token: string
): Promise<SubCategory> {
  return apiRequest<SubCategory>(`/api/SubCategory/GetById/${id}`, {
    method: 'GET',
    token,
  });
}

/**
 * Get subcategories by category ID
 */
export async function getSubCategoriesByCategoryId(
  categoryId: string,
  token: string
): Promise<SubCategory[]> {
  return apiRequest<SubCategory[]>(`/api/SubCategory/GetByCategoryId/category/${categoryId}`, {
    method: 'GET',
    token,
  });
}

/**
 * Get all subcategories
 */
export async function getAllSubCategories(token: string): Promise<SubCategory[]> {
  return apiRequest<SubCategory[]>('/api/SubCategory/GetAll', {
    method: 'GET',
    token,
  });
}

/**
 * Delete a subcategory
 */
export async function deleteSubCategory(id: string, token: string): Promise<void> {
  return apiRequest<void>(`/api/SubCategory/Delete/${id}`, {
    method: 'DELETE',
    token,
  });
}
