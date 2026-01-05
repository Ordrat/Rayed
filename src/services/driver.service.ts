/**
 * Driver service for handling all driver-related API calls
 */

import { apiRequest } from '@/lib/api-client';
import {
  Driver,
  RegisterDriverRequest,
  UpdateDriverRequest,
  ChangeDriverAccountStatusRequest,
  DriverDocument,
  ChangeDocumentStatusRequest,
} from '@/types/driver.types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

/**
 * Register a new driver (public - for driver signup)
 */
export async function registerDriver(
  data: RegisterDriverRequest
): Promise<Driver> {
  return apiRequest<Driver>('/api/Driver/RegisterDriver', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing driver
 */
export async function updateDriver(
  data: UpdateDriverRequest,
  token: string
): Promise<Driver> {
  return apiRequest<Driver>('/api/Driver/UpdateDriver', {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Get all drivers (admin only)
 */
export async function getAllDrivers(token: string): Promise<Driver[]> {
  return apiRequest<Driver[]>('/api/Driver/GetAll', {
    method: 'GET',
    token,
  });
}

/**
 * Get a driver by ID
 */
export async function getDriverById(
  id: string,
  token: string
): Promise<Driver> {
  return apiRequest<Driver>(`/api/Driver/GetById/${id}`, {
    method: 'GET',
    token,
  });
}

/**
 * Change driver account status (approve/reject/suspend)
 */
export async function changeDriverAccountStatus(
  data: ChangeDriverAccountStatusRequest,
  token: string
): Promise<void> {
  return apiRequest<void>('/api/Driver/ChangeAccountStatus/change-status', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

// =====================
// Driver Document APIs
// =====================

/**
 * Create a driver document (multipart/form-data)
 */
export async function createDriverDocument(
  formData: FormData,
  token?: string
): Promise<DriverDocument> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}/api/DriverDocument/CreateDocument`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.title || 'Failed to create document');
  }

  return response.json();
}

/**
 * Update a driver document (multipart/form-data)
 */
export async function updateDriverDocument(
  formData: FormData,
  token: string
): Promise<DriverDocument> {
  const response = await fetch(`${API_BASE}/api/DriverDocument/UpdateDocument`, {
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
 * Get all documents for a driver
 */
export async function getDriverDocuments(
  driverId: string,
  token: string
): Promise<DriverDocument[]> {
  return apiRequest<DriverDocument[]>(`/api/DriverDocument/GetByDriverId/driver/${driverId}`, {
    method: 'GET',
    token,
  });
}

/**
 * Get a document by ID
 */
export async function getDriverDocumentById(
  id: string,
  token: string
): Promise<DriverDocument> {
  return apiRequest<DriverDocument>(`/api/DriverDocument/GetById/${id}`, {
    method: 'GET',
    token,
  });
}

/**
 * Change document verification status (approve/reject)
 */
export async function changeDriverDocumentStatus(
  data: ChangeDocumentStatusRequest,
  token: string
): Promise<void> {
  return apiRequest<void>('/api/DriverDocument/ChangeStatus/change-status', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Delete a driver document
 */
export async function deleteDriverDocument(
  id: string,
  token: string
): Promise<void> {
  return apiRequest<void>(`/api/DriverDocument/DeleteDocument/${id}`, {
    method: 'DELETE',
    token,
  });
}
