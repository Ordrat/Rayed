"use client";

import { Link } from "@/i18n/routing";
import { useState, useEffect } from "react";
import { Button, Text, Input, Password } from "rizzui";
import { SubmitHandler } from "react-hook-form";
import { Form } from "@core/ui/form";
import { routes } from "@/config/routes";
import { ResetPasswordSchema, resetPasswordSchema } from "@/validators/reset-password.schema";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "@/i18n/routing";
import { resetPassword } from "@/services/auth.service";
import toast from "react-hot-toast";

export default function ForgetPasswordForm() {
  const t = useTranslations("form");
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill email/phone from session if available
  const initialValues: ResetPasswordSchema = {
    phoneNumberOrEmail: session?.user?.email || session?.user?.phoneNumber || "",
    resetToken: "",
    newPassword: "",
    confirmPassword: "",
  };

  const onSubmit: SubmitHandler<ResetPasswordSchema> = async (data) => {
    setIsLoading(true);
    try {
      const response = await resetPassword(data);

      // Update session with new tokens
      await update({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        accessTokenExpiration: response.accessTokenExpirationDate,
      });

      toast.success("Password reset successful! Redirecting...");

      // Redirect to dashboard after successful reset
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form<ResetPasswordSchema>
        validationSchema={resetPasswordSchema(t)}
        onSubmit={onSubmit}
        useFormProps={{
          mode: "onChange",
          defaultValues: initialValues,
        }}
        className="pt-1.5"
      >
        {({ register, formState: { errors } }) => (
          <div className="space-y-6">
            <Input
              type="text"
              size="lg"
              label="Email or Phone"
              placeholder="Enter your email or phone number"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("phoneNumberOrEmail")}
              error={errors.phoneNumberOrEmail?.message}
              disabled={isLoading}
            />
            <Input
              type="text"
              size="lg"
              label="Reset Token"
              placeholder="Enter reset token provided by support"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("resetToken")}
              error={errors.resetToken?.message}
              disabled={isLoading}
            />
            <Password
              label="New Password"
              placeholder="Enter your new password"
              size="lg"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("newPassword")}
              error={errors.newPassword?.message}
              disabled={isLoading}
            />
            <Password
              label="Confirm Password"
              placeholder="Confirm your new password"
              size="lg"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
              disabled={isLoading}
            />
            <Button
              className="mt-2 w-full"
              type="submit"
              size="lg"
              isLoading={isLoading}
            >
              {t("form-reset-password")}
            </Button>
          </div>
        )}
      </Form>
      <Text className="mt-6 text-center text-[15px] leading-loose text-gray-500 lg:mt-8 lg:text-start xl:text-base">
        {t("form-dont-want-to-reset-password")}{" "}
        <Link
          href={routes.auth.signIn}
          className="font-bold text-gray-700 transition-colors hover:text-blue"
        >
          Sign In
        </Link>
      </Text>
    </>
  );
}
