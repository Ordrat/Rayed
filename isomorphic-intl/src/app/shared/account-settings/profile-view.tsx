"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { SubmitHandler } from "react-hook-form";
import { PiEnvelopeSimple, PiLockKey } from "react-icons/pi";
import { Form } from "@core/ui/form";
import { Text, Input, Password, Button, Title } from "rizzui";
import FormGroup from "@/app/shared/form-group";
import FormFooter from "@core/components/form-footer";
import { profileSchema, ProfileFormData, getDefaultProfileValues } from "@/validators/profile.schema";
import { changePassword } from "@/services/auth.service";
import { useTranslations } from "next-intl";

export default function ProfileView() {
  const t = useTranslations("form");
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [defaultValues, setDefaultValues] = useState<ProfileFormData>(getDefaultProfileValues());

  // Update default values when session is available
  useEffect(() => {
    if (session?.user) {
      setDefaultValues(getDefaultProfileValues(session.user));
    }
  }, [session]);

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
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

      // Log profile data for debugging
      console.log("Profile data ->", {
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
    <>
      <div className="@container mb-10">
        <div className="mb-8">
          <Title as="h2" className="mb-2 text-xl font-bold">
            {t("form-profile-settings") || "Profile Settings"}
          </Title>
          <Text className="text-sm text-gray-500">
            {t("form-profile-settings-description") || "Update your personal information and password"}
          </Text>
        </div>

        <Form<ProfileFormData>
          validationSchema={profileSchema(t)}
          onSubmit={onSubmit}
          className="@container"
          useFormProps={{
            mode: "onChange",
            defaultValues,
            values: defaultValues, // This ensures the form updates when defaultValues change
          }}
        >
          {({ register, formState: { errors } }) => {
            return (
              <>
                <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
                  {/* Personal Information Section removed as requested */}

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
                    title={t("form-change-password")}
                    description={t("form-change-password-description")}
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
                        helperText={t("form-password-helper-text")}
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
      </div>
    </>
  );
}
