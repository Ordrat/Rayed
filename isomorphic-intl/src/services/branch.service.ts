/**
 * Branch service for handling all branch-related API calls
 */

import { apiRequest } from '@/lib/api-client';
import {
  Branch,
  ChangeBranchStatusRequest,
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
