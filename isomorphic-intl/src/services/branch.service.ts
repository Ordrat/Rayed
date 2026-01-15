/**
 * Branch service for handling all branch-related API calls
 */

import { apiRequest } from '@/lib/api-client';
import {
  Branch,
  ChangeBranchStatusRequest,
  GetBranchesParams,
} from '@/types/branch.types';

/**
 * Get a branch by ID
 */
export async function getBranchById(
  id: string,
  token: string
): Promise<Branch> {
  return apiRequest<Branch>(`/api/Branch/${id}`, {
    method: 'GET',
    token,
  });
}

/**
 * Change branch status (approve/reject)
 */
export async function changeBranchStatus(
  data: ChangeBranchStatusRequest,
  token: string
): Promise<void> {
  return apiRequest<void>('/api/Branch/change-status', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Get all branches for a shop
 */
export async function getBranchesByShop(
  shopId: string,
  token: string
): Promise<Branch[]> {
  return apiRequest<Branch[]>(`/api/Branch/shop/${shopId}`, {
    method: 'GET',
    token,
  });
}

/**
 * Get all branches with optional filters
 */
export async function getAllBranches(
  params: GetBranchesParams = {},
  token: string
): Promise<Branch[]> {
  const queryParams = new URLSearchParams();

  if (params.shopId) queryParams.append('shopId', params.shopId);
  if (params.cityId) queryParams.append('cityId', params.cityId);
  if (params.status !== undefined) queryParams.append('status', params.status.toString());
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
  if (params.isOpen !== undefined) queryParams.append('isOpen', params.isOpen.toString());
  if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

  const queryString = queryParams.toString();
  const url = queryString ? `/api/Branch?${queryString}` : '/api/Branch';

  const response = await apiRequest<any>(url, {
    method: 'GET',
    token,
  });

  // Handle different response formats
  if (Array.isArray(response)) {
    return response as Branch[];
  }

  // If response is paginated (has items/data property)
  if (response && typeof response === 'object') {
    if (Array.isArray(response.items)) {
      return response.items as Branch[];
    }
    if (Array.isArray(response.data)) {
      return response.data as Branch[];
    }
    if (Array.isArray(response.branches)) {
      return response.branches as Branch[];
    }
  }

  // If response is a string, try to parse it
  if (typeof response === 'string') {
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        return parsed as Branch[];
      }
      if (parsed && Array.isArray(parsed.items)) {
        return parsed.items as Branch[];
      }
      if (parsed && Array.isArray(parsed.data)) {
        return parsed.data as Branch[];
      }
    } catch (e) {
      console.error('Failed to parse branches response:', e);
    }
  }

  console.warn('Unexpected API response format:', response);
  return [];
}
