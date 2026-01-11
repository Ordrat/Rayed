/**
 * Support Ticket Types
 */

import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from './firebase.enums';

/**
 * Support ticket from API
 */
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdByUserId: string;
  orderId?: string;
  assignedToSupportId?: string;
  createdAt: string;
  assignedAt?: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  lastMessageAt?: string;
  resolutionTimeHours?: number;
  customerSatisfactionRating?: number;
}

/**
 * Request to create a new ticket
 */
export interface CreateTicketRequest {
  subject: string;
  category: TicketCategory;
  orderId?: string;
}

/**
 * Request to update a ticket
 */
export interface UpdateTicketRequest {
  subject?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;
  assignedToSupportId?: string;
  customerSatisfactionRating?: number;
}

/**
 * Request to close a ticket
 */
export interface CloseTicketRequest {
  archiveMessages?: boolean;
  deleteFirebaseChat?: boolean;
  closureNotes?: string;
}

/**
 * Ticket action record
 */
export interface TicketAction {
  id: string;
  ticketId: string;
  supportUserId: string;
  actionType: number;
  actionDetails?: string;
  refundAmount?: number;
  compensationType?: number;
  compensationValue?: number;
  createdAt: string;
}

/**
 * Add action request
 */
export interface AddTicketActionRequest {
  actionType: number;
  actionDetails?: string;
  refundAmount?: number;
  compensationType?: number;
  compensationValue?: number;
}

/**
 * Paginated tickets response
 */
export interface PaginatedTicketsResponse {
  items: SupportTicket[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Archived message
 */
export interface ArchivedMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderType: number;
  messageType: number;
  messageText: string;
  imageUrl?: string;
  actionType?: string;
  actionData?: string;
  isInternal?: boolean;
  sentAt: string;
  readAt?: string;
}
