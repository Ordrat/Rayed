"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { SubmitHandler, Controller } from "react-hook-form";
import { PiEnvelopeSimple, PiLockKey } from "react-icons/pi";
import { Form } from "@core/ui/form";
import { Text, Input, Password, Button, Title } from "rizzui";
import FormGroup from "@/app/shared/form-group";
import FormFooter from "@core/components/form-footer";
import { changePassword } from "@/services/auth.service";
import { useTranslations } from "next-intl";
import { z } from "zod";

// Combined schema for personal info + password change
const createCombinedSchema = (t: (key: string) => string) =>
  z
    .object({
      firstName: z.string().min(1, t("form-first-name-required") || "First name is required"),
      lastName: z.string().min(1, t("form-last-name-required") || "Last name is required"),
      email: z.string().email(t("form-email-invalid") || "Invalid email"),
      // Password fields are optional - only validated if user wants to change password
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

type CombinedFormTypes = z.infer<ReturnType<typeof createCombinedSchema>>;

export default function PersonalInfoView() {
  const t = useTranslations("form");
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [defaultValues, setDefaultValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Update default values when session is available
  useEffect(() => {
    if (session?.user) {
      setDefaultValues({
        firstName: session.user.firstName || "",
        lastName: session.user.lastName || "",
        email: session.user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [session]);

  const onSubmit: SubmitHandler<CombinedFormTypes> = async (data) => {
    setIsLoading(true);
    try {
      // Check if user wants to change password
      const wantsPasswordChange = data.currentPassword && data.newPassword && data.confirmPassword;

      if (wantsPasswordChange) {
        await changePassword(
          {
            oldPassword: data.currentPassword!,
            newPassword: data.newPassword!,
            confirmPassword: data.confirmPassword!,
          },
          session?.accessToken || ""
        );

        // Update the session to reflect that password reset is no longer needed
        if (session?.user?.needsPasswordReset) {
          await update({
            ...session,
            user: {
              ...session?.user,
              needsPasswordReset: false,
            },
          });
        }

        toast.success(t("password-updated-successfully") || "Password updated successfully");
      } else {
        toast.success(<Text as="b">{t("form-profile-updated") || "Profile updated successfully!"}</Text>);
      }

      console.log("Profile settings data ->", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || t("form-update-failed") || "Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form<CombinedFormTypes>
      validationSchema={createCombinedSchema(t)}
      onSubmit={onSubmit}
      className="@container"
      useFormProps={{
        mode: "onChange",
        defaultValues,
        values: defaultValues, // This ensures the form updates when defaultValues change
      }}
    >
      {({ register, control, formState: { errors } }) => {
        return (
          <>
            <FormGroup
              title={t("form-personal-info")}
              description={t("form-personal-info-description")}
              className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            />

            <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
              <FormGroup title={t("form-name")} className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11">
                <Input
                  placeholder={t("form-first-name")}
                  {...register("firstName")}
                  error={errors.firstName?.message}
                  className="flex-grow"
                />
                <Input
                  placeholder={t("form-last-name")}
                  {...register("lastName")}
                  error={errors.lastName?.message}
                  className="flex-grow"
                />
              </FormGroup>

              <FormGroup title={t("form-email-address")} className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11">
                <Input
                  className="col-span-full"
                  prefix={<PiEnvelopeSimple className="h-6 w-6 text-gray-500" />}
                  type="email"
                  placeholder={t("form-email-address-placeholder")}
                  {...register("email")}
                  error={errors.email?.message}
                  disabled // Email cannot be changed
                />
              </FormGroup>

              {/* Password Change Section */}
              <FormGroup
                title={t("form-change-password") || "Change Password"}
                description={
                  t("form-change-password-description") || "Leave blank if you don't want to change your password"
                }
                className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                <div className="col-span-full space-y-4">
                  <Password
                    label={t("form-current-password")}
                    placeholder={t("form-password-placeholder")}
                    {...register("currentPassword")}
                    error={errors.currentPassword?.message}
                    prefix={<PiLockKey className="h-5 w-5 text-gray-500" />}
                  />
                  <Password
                    label={t("form-new-password")}
                    placeholder={t("form-password-placeholder")}
                    helperText={t("form-password-helper-text") || "Password must be at least 8 characters"}
                    {...register("newPassword")}
                    error={errors.newPassword?.message}
                    prefix={<PiLockKey className="h-5 w-5 text-gray-500" />}
                  />
                  <Password
                    label={t("form-confirm-new-password")}
                    placeholder={t("form-password-placeholder")}
                    {...register("confirmPassword")}
                    error={errors.confirmPassword?.message}
                    prefix={<PiLockKey className="h-5 w-5 text-gray-500" />}
                  />
                </div>
              </FormGroup>
            </div>

            <FormFooter isLoading={isLoading} altBtnText={t("form-cancel")} submitBtnText={t("form-save")} />
          </>
        );
      }}
    </Form>
  );
}
