/**
 * Seller service for handling all seller-related API calls
 */

import { apiRequest } from '@/lib/api-client';
import {
  Seller,
  RegisterSellerRequest,
  UpdateSellerRequest,
  ChangeSellerAccountStatusRequest,
  SellerDocument,
  ChangeSellerDocumentStatusRequest,
} from '@/types/seller.types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

/**
 * Register a new seller (public - for seller signup)
 */
export async function registerSeller(
  data: RegisterSellerRequest
): Promise<Seller> {
  return apiRequest<Seller>('/api/Seller/RegisterSeller', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing seller
 */
export async function updateSeller(
  data: UpdateSellerRequest,
  token: string
): Promise<Seller> {
  return apiRequest<Seller>('/api/Seller/UpdateSeller', {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Get all sellers (admin only)
 */
export async function getAllSellers(token: string): Promise<Seller[]> {
  return apiRequest<Seller[]>('/api/Seller/GetAll', {
    method: 'GET',
    token,
  });
}

/**
 * Get a seller by ID
 */
export async function getSellerById(
  id: string,
  token: string
): Promise<Seller> {
  return apiRequest<Seller>(`/api/Seller/GetById/${id}`, {
    method: 'GET',
    token,
  });
}

/**
 * Change seller account status (approve/reject/suspend)
 */
export async function changeSellerAccountStatus(
  data: ChangeSellerAccountStatusRequest,
  token: string
): Promise<void> {
  return apiRequest<void>('/api/Seller/ChangeAccountStatus', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

// =====================
// Seller Document APIs
// =====================

/**
 * Create seller documents (multipart/form-data)
 */
export async function createSellerDocuments(
  formData: FormData,
  token?: string
): Promise<SellerDocument[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}/api/SellerDocument/CreateDocument`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.title || 'Failed to create documents');
  }

  return response.json();
}

/**
 * Update a seller document (multipart/form-data)
 */
export async function updateSellerDocument(
  formData: FormData,
  token: string
): Promise<SellerDocument> {
  const response = await fetch(`${API_BASE}/api/SellerDocument/UpdateDocument`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.title || 'Failed to update document');
  }

  return response.json();
}

/**
 * Get all documents for a seller
 */
export async function getSellerDocuments(
  sellerId: string,
  token: string
): Promise<SellerDocument[]> {
  return apiRequest<SellerDocument[]>(`/api/SellerDocument/GetBySellerId/seller/${sellerId}`, {
    method: 'GET',
    token,
  });
}

/**
 * Get a document by ID
 */
export async function getSellerDocumentById(
  id: string,
  token: string
): Promise<SellerDocument> {
  return apiRequest<SellerDocument>(`/api/SellerDocument/GetById/${id}`, {
    method: 'GET',
    token,
  });
}

/**
 * Change document verification status (approve/reject)
 */
export async function changeSellerDocumentStatus(
  data: ChangeSellerDocumentStatusRequest,
  token: string
): Promise<void> {
  return apiRequest<void>('/api/SellerDocument/ChangeStatus', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Delete a seller document
 */
export async function deleteSellerDocument(
  id: string,
  token: string
): Promise<void> {
  return apiRequest<void>(`/api/SellerDocument/DeleteDocument/${id}`, {
    method: 'DELETE',
    token,
  });
}
