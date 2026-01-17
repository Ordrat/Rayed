/**
 * Support Ticket Service
 * Handles all support ticket API operations
 *
 * API Endpoints:
 * - POST /api/SupportTicket/CreateSupportTicket - Create new ticket (auto-assigns to agent)
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
  CreateTicketRequest,
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
 * Create a new support ticket
 * The backend will automatically assign it to an available agent
 * Uses: POST /api/SupportTicket/CreateSupportTicket
 */
export async function createSupportTicket(
  data: CreateTicketRequest,
  token: string
): Promise<SupportTicket> {
  console.log('[Support] Creating ticket:', data);
  try {
    const result = await apiRequest<SupportTicket>(`${BASE_URL}/CreateSupportTicket`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
    console.log('[Support] Ticket created successfully:', {
      id: result.id,
      ticketNumber: result.ticketNumber,
      assignedToSupportId: result.assignedToSupportId,
      status: result.status
    });
    return result;
  } catch (error: any) {
    console.error('[Support] Failed to create ticket:', error?.message || error);
    throw error;
  }
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

  const result = await apiRequest<SupportTicket[] | { items?: SupportTicket[]; tickets?: SupportTicket[] }>(endpoint, {
    method: 'GET',
    token,
  });

  // Handle different response formats
  let tickets: SupportTicket[];
  if (Array.isArray(result)) {
    tickets = result;
  } else if (result && typeof result === 'object') {
    if ('items' in result && Array.isArray(result.items)) {
      tickets = result.items;
    } else if ('tickets' in result && Array.isArray(result.tickets)) {
      tickets = result.tickets;
    } else {
      tickets = [];
    }
  } else {
    tickets = [];
  }

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

  const result = await apiRequest<SupportTicket[] | { items?: SupportTicket[]; tickets?: SupportTicket[] }>(endpoint, {
    method: 'GET',
    token,
  });

  // Handle different response formats
  let tickets: SupportTicket[];
  if (Array.isArray(result)) {
    tickets = result;
  } else if (result && typeof result === 'object') {
    if ('items' in result && Array.isArray(result.items)) {
      tickets = result.items;
    } else if ('tickets' in result && Array.isArray(result.tickets)) {
      tickets = result.tickets;
    } else {
      tickets = [];
    }
  } else {
    tickets = [];
  }

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

  const result = await apiRequest<SupportTicket[] | { items?: SupportTicket[]; tickets?: SupportTicket[] }>(endpoint, {
    method: 'GET',
    token,
  });

  // Handle different response formats
  let tickets: SupportTicket[];
  if (Array.isArray(result)) {
    tickets = result;
  } else if (result && typeof result === 'object') {
    if ('items' in result && Array.isArray(result.items)) {
      tickets = result.items;
    } else if ('tickets' in result && Array.isArray(result.tickets)) {
      tickets = result.tickets;
    } else {
      tickets = [];
    }
  } else {
    tickets = [];
  }

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
  console.log('[Support] Closing ticket:', { ticketId, data });
  try {
    const result = await apiRequest<SupportTicket>(`${BASE_URL}/CloseSupportTicket/${ticketId}/close`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
    console.log('[Support] Ticket closed successfully:', result.id);
    return result;
  } catch (error: any) {
    console.error('[Support] Failed to close ticket:', {
      ticketId,
      error: error?.message || error,
      data: error?.data,
      status: error?.status
    });
    throw error;
  }
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
  console.log('[Support] Assigning ticket:', { ticketId, supportAgentId });
  try {
    const result = await updateSupportTicket(
      ticketId,
      { assignedToSupportId: supportAgentId },
      token
    );
    console.log('[Support] Ticket assigned successfully');
    return result;
  } catch (error: any) {
    console.error('[Support] Failed to assign ticket:', error?.message || error);
    throw error;
  }
}
