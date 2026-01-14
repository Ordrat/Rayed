import { z } from "zod";
import { messages } from "@/config/messages";
import { validateEmail } from "./common-rules";

// Simplified profile validation schema
export const profileSchema = (t: (arg: string) => string) =>
  z
    .object({
      // Personal Information
      firstName: z.string().min(1, t(messages.firstNameRequired)),
      lastName: z.string().min(1, t(messages.lastNameRequired)),
      email: validateEmail(t),

      // Password Change (Optional)
      currentPassword: z.string().optional(),
      newPassword: z.string().optional(),
      confirmPassword: z.string().optional(),
    })
    .refine(
      (data) => {
        // If any password field is filled, all must be filled
        const hasCurrentPassword = data.currentPassword && data.currentPassword.length > 0;
        const hasNewPassword = data.newPassword && data.newPassword.length > 0;
        const hasConfirmPassword = data.confirmPassword && data.confirmPassword.length > 0;

        if (hasCurrentPassword || hasNewPassword || hasConfirmPassword) {
          return hasCurrentPassword && hasNewPassword && hasConfirmPassword;
        }
        return true;
      },
      {
        message: t("form-all-password-fields-required") || "All password fields are required to change password",
        path: ["currentPassword"],
      }
    )
    .refine(
      (data) => {
        if (data.newPassword && data.newPassword.length > 0) {
          return data.newPassword.length >= 8;
        }
        return true;
      },
      {
        message: t("form-password-min-length") || "Password must be at least 8 characters",
        path: ["newPassword"],
      }
    )
    .refine(
      (data) => {
        if (data.newPassword && data.confirmPassword) {
          return data.newPassword === data.confirmPassword;
        }
        return true;
      },
      {
        message: t("form-passwords-not-match") || "Passwords do not match",
        path: ["confirmPassword"],
      }
    );

// Generate form types from zod validation schema
export type ProfileFormData = z.infer<ReturnType<typeof profileSchema>>;

// Default values factory
export const getDefaultProfileValues = (sessionUser?: any): ProfileFormData => ({
  // Personal Information
  firstName: sessionUser?.firstName || "",
  lastName: sessionUser?.lastName || "",
  email: sessionUser?.email || "",

  // Password fields
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
