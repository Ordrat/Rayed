/**
 * Support Ticket Service
 * Handles all support ticket API operations
 * 
 * API Endpoints:
 * - GET /api/SupportTicket/GetAllSupportTickets/all - Get all tickets (Admin)
 * - GET /api/SupportTicket/GetSupportTickets/support - Get tickets (Support Agent)
 * - GET /api/SupportTicket/GetUserSupportTickets/user - Get tickets for current user
 * - GET /api/SupportTicket/GetSupportTicketById/{ticketId} - Get single ticket
 * - PUT /api/SupportTicket/UpdateSupportTicket/{ticketId} - Update ticket
 * - POST /api/SupportTicket/CloseSupportTicket/{ticketId}/close - Close ticket
 * - POST /api/SupportTicket/AddSupportTicketAction/{ticketId}/actions - Add action
 * - GET /api/SupportTicket/GetSupportTicketActions/{ticketId}/actions - Get actions
 * - GET /api/SupportTicket/GetArchivedMessages/{ticketId}/messages - Get archived messages
 */

import { apiRequest } from '@/lib/api-client';
import {
  SupportTicket,
  UpdateTicketRequest,
  CloseTicketRequest,
  TicketAction,
  AddTicketActionRequest,
  ArchivedMessage,
} from '@/types/support-ticket.types';

const BASE_URL = '/api/SupportTicket';

/**
 * Ticket filter options
 */
export interface TicketFilters {
  status?: number; // 1-6
  category?: number; // 1-8
  priority?: number; // 1-4
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Get all tickets for admin
 * Uses: GET /api/SupportTicket/GetAllSupportTickets/all
 */
export async function getAllTickets(
  token: string,
  filters?: TicketFilters
): Promise<SupportTicket[]> {
  const params = new URLSearchParams();
  
  if (filters?.status) params.append('status', filters.status.toString());
  if (filters?.category) params.append('category', filters.category.toString());
  if (filters?.priority) params.append('priority', filters.priority.toString());
  params.append('pageNumber', (filters?.pageNumber || 1).toString());
  params.append('pageSize', (filters?.pageSize || 100).toString());
  
  const endpoint = `${BASE_URL}/GetAllSupportTickets/all?${params}`;
  console.log('[SupportTicket] Admin fetching all tickets from:', endpoint);
  
  const result = await apiRequest<SupportTicket[] | { items?: SupportTicket[]; tickets?: SupportTicket[] }>(endpoint, {
    method: 'GET',
    token,
  });
  
  console.log('[SupportTicket] Admin API Response:', result);
  
  // Handle different response formats: direct array, { items: [...] }, or { tickets: [...] }
  let tickets: SupportTicket[];
  if (Array.isArray(result)) {
    tickets = result;
  } else if (result && typeof result === 'object') {
    // Check for 'items' or 'tickets' property
    if ('items' in result && Array.isArray(result.items)) {
      tickets = result.items;
    } else if ('tickets' in result && Array.isArray(result.tickets)) {
      tickets = result.tickets;
    } else {
      console.warn('[SupportTicket] Unexpected response format:', result);
      tickets = [];
    }
  } else {
    console.warn('[SupportTicket] Unexpected response format:', result);
    tickets = [];
  }
  
  console.log('[SupportTicket] Tickets count:', tickets.length);
  return tickets;
}

/**
 * Get tickets for support agent
 * Uses: GET /api/SupportTicket/GetSupportTickets/support
 */
export async function getSupportAgentTickets(
  token: string,
  filters?: TicketFilters
): Promise<SupportTicket[]> {
  const params = new URLSearchParams();
  
  if (filters?.status) params.append('status', filters.status.toString());
  if (filters?.category) params.append('category', filters.category.toString());
  if (filters?.priority) params.append('priority', filters.priority.toString());
  params.append('pageNumber', (filters?.pageNumber || 1).toString());
  params.append('pageSize', (filters?.pageSize || 100).toString());
  
  const endpoint = `${BASE_URL}/GetSupportTickets/support?${params}`;
  console.log('[SupportTicket] Support agent fetching tickets from:', endpoint);
  
  const result = await apiRequest<SupportTicket[] | { items?: SupportTicket[]; tickets?: SupportTicket[] }>(endpoint, {
    method: 'GET',
    token,
  });
  
  console.log('[SupportTicket] Support agent API Response:', result);
  
  // Handle different response formats: direct array, { items: [...] }, or { tickets: [...] }
  let tickets: SupportTicket[];
  if (Array.isArray(result)) {
    tickets = result;
  } else if (result && typeof result === 'object') {
    // Check for 'items' or 'tickets' property
    if ('items' in result && Array.isArray(result.items)) {
      tickets = result.items;
    } else if ('tickets' in result && Array.isArray(result.tickets)) {
      tickets = result.tickets;
    } else {
      console.warn('[SupportTicket] Unexpected response format:', result);
      tickets = [];
    }
  } else {
    console.warn('[SupportTicket] Unexpected response format:', result);
    tickets = [];
  }
  
  console.log('[SupportTicket] Tickets count:', tickets.length);
  return tickets;
}

/**
 * Get all tickets for the current user (legacy endpoint)
 * - For customers: returns tickets they created
 */
export async function getUserSupportTickets(
  token: string,
  pageNumber: number = 1,
  pageSize: number = 100
): Promise<SupportTicket[]> {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });
  
  const endpoint = `${BASE_URL}/GetUserSupportTickets/user?${params}`;
  console.log('[SupportTicket] Fetching user tickets from:', endpoint);
  
  const result = await apiRequest<SupportTicket[] | { items?: SupportTicket[]; tickets?: SupportTicket[] }>(endpoint, {
    method: 'GET',
    token,
  });
  
  console.log('[SupportTicket] API Response:', result);
  
  // Handle different response formats: direct array, { items: [...] }, or { tickets: [...] }
  let tickets: SupportTicket[];
  if (Array.isArray(result)) {
    tickets = result;
  } else if (result && typeof result === 'object') {
    // Check for 'items' or 'tickets' property
    if ('items' in result && Array.isArray(result.items)) {
      tickets = result.items;
    } else if ('tickets' in result && Array.isArray(result.tickets)) {
      tickets = result.tickets;
    } else {
      console.warn('[SupportTicket] Unexpected response format:', result);
      tickets = [];
    }
  } else {
    console.warn('[SupportTicket] Unexpected response format:', result);
    tickets = [];
  }
  
  console.log('[SupportTicket] Tickets count:', tickets.length);
  return tickets;
}

// Aliases for backward compatibility
export const getAllSupportTickets = getUserSupportTickets;
export const getAllTicketsForAdmin = getAllTickets;
export const getTicketsForAgent = async (
  agentId: string,
  token: string,
  pageNumber: number = 1,
  pageSize: number = 100
) => getSupportAgentTickets(token, { pageNumber, pageSize });

/**
 * Get a single ticket by ID
 */
export async function getSupportTicketById(
  ticketId: string,
  token: string
): Promise<SupportTicket> {
  return apiRequest<SupportTicket>(`${BASE_URL}/GetSupportTicketById/${ticketId}`, {
    method: 'GET',
    token,
  });
}

/**
 * Update a support ticket
 */
export async function updateSupportTicket(
  ticketId: string,
  data: UpdateTicketRequest,
  token: string
): Promise<SupportTicket> {
  return apiRequest<SupportTicket>(`${BASE_URL}/UpdateSupportTicket/${ticketId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Close a support ticket
 */
export async function closeSupportTicket(
  ticketId: string,
  data: CloseTicketRequest,
  token: string
): Promise<SupportTicket> {
  return apiRequest<SupportTicket>(`${BASE_URL}/CloseSupportTicket/${ticketId}/close`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Add an action to a ticket
 */
export async function addTicketAction(
  ticketId: string,
  data: AddTicketActionRequest,
  token: string
): Promise<TicketAction> {
  return apiRequest<TicketAction>(`${BASE_URL}/AddSupportTicketAction/${ticketId}/actions`, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Get all actions for a ticket
 */
export async function getTicketActions(
  ticketId: string,
  token: string
): Promise<TicketAction[]> {
  return apiRequest<TicketAction[]>(`${BASE_URL}/GetSupportTicketActions/${ticketId}/actions`, {
    method: 'GET',
    token,
  });
}

/**
 * Get archived messages for a closed ticket
 */
export async function getArchivedMessages(
  ticketId: string,
  token: string,
  pageNumber: number = 1,
  pageSize: number = 50
): Promise<ArchivedMessage[]> {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });
  return apiRequest<ArchivedMessage[]>(
    `${BASE_URL}/GetArchivedMessages/${ticketId}/messages?${params}`,
    {
      method: 'GET',
      token,
    }
  );
}

/**
 * Assign ticket to a support agent (update with assignedToSupportId)
 */
export async function assignTicketToAgent(
  ticketId: string,
  supportAgentId: string,
  token: string
): Promise<SupportTicket> {
  return updateSupportTicket(
    ticketId,
    { assignedToSupportId: supportAgentId },
    token
  );
}
