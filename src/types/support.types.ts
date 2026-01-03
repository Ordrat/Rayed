/**
 * Support-related types based on the API documentation
 */

/**
 * Department enum for support agents
 */
export enum SupportDepartment {
  GENERAL = 0,
  TECHNICAL = 1,
  BILLING = 2,
  SALES = 3,
}

/**
 * Support status enum
 */
export enum SupportStatus {
  OFFLINE = 0,
  ONLINE = 1,
  BUSY = 2,
  AWAY = 3,
}

/**
 * Request to register a new support agent
 */
export interface RegisterSupportRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  department: SupportDepartment;
  canCloseTickets: boolean;
  canIssueRefunds: boolean;
  canBanUsers: boolean;
  canViewAllTickets: boolean;
}

/**
 * Request to update an existing support agent
 */
export interface UpdateSupportRequest {
  supportId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  department: SupportDepartment;
  canCloseTickets: boolean;
  canIssueRefunds: boolean;
  canBanUsers: boolean;
  canViewAllTickets: boolean;
}

/**
 * Support agent response from API
 */
export interface SupportAgent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department: SupportDepartment;
  status: SupportStatus;
  lastStatusChangeAt: string;
  totalTicketsHandled: number;
  totalTicketsResolved: number;
  averageResolutionTimeHours: number;
  customerSatisfactionScore: number;
  currentActiveTickets: number;
  canCloseTickets: boolean;
  canIssueRefunds: boolean;
  canBanUsers: boolean;
  canViewAllTickets: boolean;
  lastLoginAt: string;
  createdAt: string;
}

/**
 * Request to change support agent status
 */
export interface ChangeSupportStatusRequest {
  supportId: string;
  status: SupportStatus;
}

/**
 * Helper function to get department label
 */
export function getDepartmentLabel(department: SupportDepartment): string {
  const labels: Record<SupportDepartment, string> = {
    [SupportDepartment.GENERAL]: 'General',
    [SupportDepartment.TECHNICAL]: 'Technical',
    [SupportDepartment.BILLING]: 'Billing',
    [SupportDepartment.SALES]: 'Sales',
  };
  return labels[department] || 'Unknown';
}

/**
 * Helper function to get status label
 */
export function getStatusLabel(status: SupportStatus): string {
  const labels: Record<SupportStatus, string> = {
    [SupportStatus.OFFLINE]: 'Offline',
    [SupportStatus.ONLINE]: 'Online',
    [SupportStatus.BUSY]: 'Busy',
    [SupportStatus.AWAY]: 'Away',
  };
  return labels[status] || 'Unknown';
}
