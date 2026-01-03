/**
 * Support service for handling all support-related API calls
 */

import { apiRequest } from '@/lib/api-client';
import {
  RegisterSupportRequest,
  UpdateSupportRequest,
  SupportAgent,
  ChangeSupportStatusRequest,
} from '@/types/support.types';

/**
 * Register a new support agent
 */
export async function registerSupport(
  data: RegisterSupportRequest,
  token: string
): Promise<SupportAgent> {
  return apiRequest<SupportAgent>('/api/Support/RegisterSupport', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Update an existing support agent
 */
export async function updateSupport(
  data: UpdateSupportRequest,
  token: string
): Promise<SupportAgent> {
  return apiRequest<SupportAgent>('/api/Support/UpdateSupport', {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Get all support agents
 */
export async function getAllSupport(token: string): Promise<SupportAgent[]> {
  return apiRequest<SupportAgent[]>('/api/Support/GetAll', {
    method: 'GET',
    token,
  });
}

/**
 * Get a support agent by ID
 */
export async function getSupportById(
  id: string,
  token: string
): Promise<SupportAgent> {
  return apiRequest<SupportAgent>(`/api/Support/GetById/${id}`, {
    method: 'GET',
    token,
  });
}

/**
 * Change support agent status
 */
export async function changeSupportStatus(
  data: ChangeSupportStatusRequest,
  token: string
): Promise<void> {
  return apiRequest<void>('/api/Support/ChangeStatus/change-status', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Check if user has support role
 */
export function isSupportAgent(roles: string[]): boolean {
  return roles.some(
    (role) => role.toLowerCase() === 'support' || role.toLowerCase() === 'supportagent'
  );
}

/**
 * Check if user has admin role (can manage support agents)
 */
export function isAdmin(roles: string[]): boolean {
  return roles.some(
    (role) =>
      role.toLowerCase() === 'admin' ||
      role.toLowerCase() === 'administrator' ||
      role.toLowerCase() === 'owner'
  );
}
