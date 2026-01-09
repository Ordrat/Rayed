/**
 * Product service for handling all product-related API calls
 */

import { apiRequest } from '@/lib/api-client';
import { Product, ProductImage } from '@/types/product.types';

/**
 * Approve a product (admin only)
 */
export async function approveProduct(
  productId: string,
  token: string
): Promise<Product> {
  return apiRequest<Product>(`/api/Product/Approve/${productId}/approve`, {
    method: 'POST',
    token,
  });
}

/**
 * Reject a product (admin only)
 */
export async function rejectProduct(
  productId: string,
  token: string
): Promise<Product> {
  return apiRequest<Product>(`/api/Product/Reject/${productId}/reject`, {
    method: 'POST',
    token,
  });
}

/**
 * Get a product by ID
 */
export async function getProductById(
  id: string,
  token: string
): Promise<Product> {
  return apiRequest<Product>(`/api/Product/GetById/${id}`, {
    method: 'GET',
    token,
  });
}

/**
 * Get all products with optional status filter (admin only)
 * @param token - Auth token
 * @param status - Optional status filter: null = all, 0 = pending, 1 = approved, 2 = rejected
 */
export async function getAllProducts(
  token: string,
  status?: number | null
): Promise<Product[]> {
  const url = status !== null && status !== undefined
    ? `/api/Product/GetAllProducts?status=${status}`
    : '/api/Product/GetAllProducts';
  
  return apiRequest<Product[]>(url, {
    method: 'GET',
    token,
  });
}

/**
 * Delete a product (admin only)
 * This will delete the product along with all its images
 */
export async function deleteProduct(
  productId: string,
  token: string
): Promise<void> {
  return apiRequest<void>(`/api/Product/Delete/${productId}`, {
    method: 'DELETE',
    token,
  });
}

/**
 * Get a product image by ID
 */
export async function getProductImageById(
  id: string,
  token: string
): Promise<ProductImage> {
  return apiRequest<ProductImage>(`/api/ProductImage/GetById/${id}`, {
    method: 'GET',
    token,
  });
}

/**
 * Get all images for a product
 */
export async function getProductImages(
  productId: string,
  token: string
): Promise<ProductImage[]> {
  return apiRequest<ProductImage[]>(`/api/ProductImage/GetByProductId/product/${productId}`, {
    method: 'GET',
    token,
  });
}
