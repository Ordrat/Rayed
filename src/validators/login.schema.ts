import { z } from 'zod';

// form zod validation schema
export const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// generate form types from zod validation schema
export type LoginSchema = z.infer<typeof loginSchema>;
