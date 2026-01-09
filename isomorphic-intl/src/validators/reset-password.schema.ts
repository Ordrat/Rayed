import { z } from "zod";
import { messages } from "@/config/messages";
import { validateEmail, validatePassword, validateConfirmPassword } from "./common-rules";

// form zod validation schema
export const resetPasswordSchema = (t: (arg: string) => string) =>
  z
    .object({
      phoneNumberOrEmail: z.string().min(1, 'Email or phone number is required'),
      resetToken: z.string().min(1, 'Reset token is required'),
      newPassword: validatePassword(t),
      confirmPassword: validateConfirmPassword(t),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t(messages.passwordsDidNotMatch),
      path: ["confirmPassword"],
    });

// generate form types from zod validation schema
export type ResetPasswordSchema = z.infer<ReturnType<typeof resetPasswordSchema>>;
