/**
 * Firebase Enums
 * All enums for support tickets and chat messaging
 */

// ============ Ticket Enums ============

/**
 * Category of support ticket
 */
export enum TicketCategory {
  OrderIssue = 1,
  PaymentIssue = 2,
  DriverIssue = 3,
  RestaurantIssue = 4,
  AppIssue = 5,
  AccountIssue = 6,
  RefundRequest = 7,
  Other = 8,
}

/**
 * Priority level of ticket
 */
export enum TicketPriority {
  Low = 1,
  Medium = 2,
  High = 3,
  Urgent = 4,
}

/**
 * Current status of ticket
 */
export enum TicketStatus {
  Open = 1,
  Assigned = 2,
  InProgress = 3,
  WaitingCustomer = 4,
  Resolved = 5,
  Closed = 6,
}

// ============ Chat Enums ============

/**
 * Type of message sender
 */
export enum SenderType {
  Customer = 0,
  Support = 1,
  System = 2,
  Driver = 3,
}

/**
 * Type of chat message
 */
export enum MessageType {
  Text = 0,
  Image = 1,
  System = 2,
  Action = 3,
}

/**
 * Type of support action
 */
export enum ActionType {
  Refund = 1,
  Reorder = 2,
  Compensation = 3,
  Warning = 4,
  Ban = 5,
  Note = 6,
  EscalateToManager = 7,
}

/**
 * Type of compensation
 */
export enum CompensationType {
  Voucher = 1,
  WalletCredit = 2,
  FreeDelivery = 3,
  Discount = 4,
}

// ============ Label Helpers ============

export const TicketCategoryLabels: Record<TicketCategory, { en: string; ar: string }> = {
  [TicketCategory.OrderIssue]: { en: 'Order Issue', ar: 'مشكلة في الطلب' },
  [TicketCategory.PaymentIssue]: { en: 'Payment Issue', ar: 'مشكلة في الدفع' },
  [TicketCategory.DriverIssue]: { en: 'Driver Issue', ar: 'مشكلة في السائق' },
  [TicketCategory.RestaurantIssue]: { en: 'Restaurant Issue', ar: 'مشكلة في المطعم' },
  [TicketCategory.AppIssue]: { en: 'App Issue', ar: 'مشكلة في التطبيق' },
  [TicketCategory.AccountIssue]: { en: 'Account Issue', ar: 'مشكلة في الحساب' },
  [TicketCategory.RefundRequest]: { en: 'Refund Request', ar: 'طلب استرداد' },
  [TicketCategory.Other]: { en: 'Other', ar: 'أخرى' },
};

export const TicketPriorityLabels: Record<TicketPriority, { en: string; ar: string }> = {
  [TicketPriority.Low]: { en: 'Low', ar: 'منخفض' },
  [TicketPriority.Medium]: { en: 'Medium', ar: 'متوسط' },
  [TicketPriority.High]: { en: 'High', ar: 'مرتفع' },
  [TicketPriority.Urgent]: { en: 'Urgent', ar: 'عاجل' },
};

export const TicketStatusLabels: Record<TicketStatus, { en: string; ar: string }> = {
  [TicketStatus.Open]: { en: 'Open', ar: 'مفتوحة' },
  [TicketStatus.Assigned]: { en: 'Assigned', ar: 'تم التعيين' },
  [TicketStatus.InProgress]: { en: 'In Progress', ar: 'قيد المعالجة' },
  [TicketStatus.WaitingCustomer]: { en: 'Waiting for Customer', ar: 'بانتظار العميل' },
  [TicketStatus.Resolved]: { en: 'Resolved', ar: 'تم الحل' },
  [TicketStatus.Closed]: { en: 'Closed', ar: 'مغلقة' },
};

export const SenderTypeLabels: Record<SenderType, { en: string; ar: string }> = {
  [SenderType.Customer]: { en: 'Customer', ar: 'العميل' },
  [SenderType.Support]: { en: 'Support', ar: 'الدعم' },
  [SenderType.System]: { en: 'System', ar: 'النظام' },
  [SenderType.Driver]: { en: 'Driver', ar: 'السائق' },
};

export const ActionTypeLabels: Record<ActionType, { en: string; ar: string }> = {
  [ActionType.Refund]: { en: 'Refund', ar: 'استرداد' },
  [ActionType.Reorder]: { en: 'Reorder', ar: 'إعادة الطلب' },
  [ActionType.Compensation]: { en: 'Compensation', ar: 'تعويض' },
  [ActionType.Warning]: { en: 'Warning', ar: 'تحذير' },
  [ActionType.Ban]: { en: 'Ban', ar: 'حظر' },
  [ActionType.Note]: { en: 'Note', ar: 'ملاحظة' },
  [ActionType.EscalateToManager]: { en: 'Escalate to Manager', ar: 'تصعيد للمدير' },
};

export const CompensationTypeLabels: Record<CompensationType, { en: string; ar: string }> = {
  [CompensationType.Voucher]: { en: 'Voucher', ar: 'قسيمة' },
  [CompensationType.WalletCredit]: { en: 'Wallet Credit', ar: 'رصيد المحفظة' },
  [CompensationType.FreeDelivery]: { en: 'Free Delivery', ar: 'توصيل مجاني' },
  [CompensationType.Discount]: { en: 'Discount', ar: 'خصم' },
};
