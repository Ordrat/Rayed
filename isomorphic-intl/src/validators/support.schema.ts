import { z } from 'zod';
import { messages } from '@/config/messages';
import { validatePassword } from './common-rules';

/**
 * Schema for registering a new support agent
 */
export const registerSupportSchema = (t: (arg: string) => string) =>
  z.object({
    firstName: z.string().min(1, t(messages.firstNameRequired)),
    lastName: z.string().min(1, t(messages.lastNameRequired)),
    email: z.string().min(1, t(messages.emailIsRequired)).email(t(messages.invalidEmail)),
    phoneNumber: z.string().min(1, t(messages.phoneNumberIsRequired)),
    password: validatePassword(t),
    department: z.number().min(0).max(3),
    canCloseTickets: z.boolean(),
    canIssueRefunds: z.boolean(),
    canBanUsers: z.boolean(),
    canViewAllTickets: z.boolean(),
  });

export type RegisterSupportSchema = z.infer<ReturnType<typeof registerSupportSchema>>;

/**
 * Schema for updating an existing support agent
 */
export const updateSupportSchema = (t: (arg: string) => string) =>
  z.object({
    supportId: z.string().uuid(),
    firstName: z.string().min(1, t(messages.firstNameRequired)),
    lastName: z.string().min(1, t(messages.lastNameRequired)),
    email: z.string().min(1, t(messages.emailIsRequired)).email(t(messages.invalidEmail)),
    phoneNumber: z.string().min(1, t(messages.phoneNumberIsRequired)),
    department: z.number().min(0).max(3),
    canCloseTickets: z.boolean(),
    canIssueRefunds: z.boolean(),
    canBanUsers: z.boolean(),
    canViewAllTickets: z.boolean(),
  });

export type UpdateSupportSchema = z.infer<ReturnType<typeof updateSupportSchema>>;
