"use client";

import { Link, useRouter } from "@/i18n/routing";
import { useState, useEffect } from "react";
import { Button, Text, Input, Password, PinCode } from "rizzui";
import { SubmitHandler, useForm } from "react-hook-form";
import { routes } from "@/config/routes";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { forgotPassword, verifyResetCode, resetPassword } from "@/services/auth.service";
import toast from "react-hot-toast";

type Step = "request" | "verify" | "reset";

type RequestFormValues = {
  identifier: string;
};

type VerifyFormValues = {
  code: string;
};

type ResetFormValues = {
  newPassword: string;
  confirmPassword: string;
};

export default function ForgotPasswordForm() {
  const t = useTranslations("form");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const { update } = useSession();

  const [step, setStep] = useState<Step>("request");
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Request reset code
  const handleRequestCode: SubmitHandler<RequestFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const isEmail = data.identifier.includes("@");
      await forgotPassword({
        email: isEmail ? data.identifier : undefined,
        phoneNumber: !isEmail ? data.identifier : undefined,
      });

      setIdentifier(data.identifier);
      setStep("verify");
      toast.success(tAuth("auth-reset-code-sent") || "Reset code sent successfully!");
    } catch (error: any) {
      if (error.message?.includes("429") || error.message?.includes("Too Many")) {
        toast.error(tAuth("auth-too-many-requests") || "Too many requests. Please wait before trying again.");
        setCountdown(120);
      } else {
        toast.error(error.message || "Failed to send reset code");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify reset code
  const handleVerifyCode: SubmitHandler<VerifyFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const response = await verifyResetCode({
        phoneNumberOrEmail: identifier,
        resetCode: data.code,
      });

      // The response contains the reset token to use in the next step
      setResetToken(data.code);
      setStep("reset");
      toast.success(tAuth("auth-code-verified") || "Code verified successfully!");
    } catch (error: any) {
      toast.error(error.message || "Invalid reset code");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword: SubmitHandler<ResetFormValues> = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error(t("form-passwords-do-not-match") || "Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPassword({
        phoneNumberOrEmail: identifier,
        resetToken: resetToken,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      // Update session with new tokens
      await update({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        accessTokenExpiration: response.accessTokenExpirationDate,
      });

      toast.success(tAuth("auth-password-reset-success") || "Password reset successful! Redirecting...");

      setTimeout(() => {
        router.push(routes.auth.signIn);
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || !identifier) return;

    setIsLoading(true);
    try {
      const isEmail = identifier.includes("@");
      await forgotPassword({
        email: isEmail ? identifier : undefined,
        phoneNumber: !isEmail ? identifier : undefined,
      });
      toast.success(tAuth("auth-code-resent-success") || "Reset code resent!");
      setCountdown(60);
    } catch (error: any) {
      if (error.message?.includes("429") || error.message?.includes("Too Many")) {
        toast.error(tAuth("auth-too-many-requests") || "Too many requests.");
        setCountdown(120);
      } else {
        toast.error(error.message || "Failed to resend code");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Request Code Form
  if (step === "request") {
    return <RequestCodeForm onSubmit={handleRequestCode} isLoading={isLoading} t={t} tAuth={tAuth} />;
  }

  // Step 2: Verify Code Form
  if (step === "verify") {
    return (
      <VerifyCodeForm
        onSubmit={handleVerifyCode}
        isLoading={isLoading}
        identifier={identifier}
        countdown={countdown}
        onResend={handleResendCode}
        onBack={() => setStep("request")}
        t={t}
        tAuth={tAuth}
      />
    );
  }

  // Step 3: Reset Password Form
  return <ResetPasswordForm onSubmit={handleResetPassword} isLoading={isLoading} t={t} tAuth={tAuth} />;
}

// Step 1 Component
function RequestCodeForm({
  onSubmit,
  isLoading,
  t,
  tAuth,
}: {
  onSubmit: SubmitHandler<RequestFormValues>;
  isLoading: boolean;
  t: any;
  tAuth: any;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestFormValues>();

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="pt-1.5">
        <div className="space-y-6">
          <Input
            type="text"
            size="lg"
            label={tAuth("auth-email-or-phone") || "Email or Phone Number"}
            placeholder={tAuth("auth-enter-email-or-phone") || "Enter your email or phone number"}
            className="[&>label>span]:font-medium"
            inputClassName="text-sm"
            {...register("identifier", { required: "This field is required" })}
            error={errors.identifier?.message}
            disabled={isLoading}
          />
          <Button className="mt-2 w-full" type="submit" size="lg" isLoading={isLoading}>
            {t("form-send-reset-code") || "Send Reset Code"}
          </Button>
        </div>
      </form>
      <Text className="mt-6 text-center text-[15px] leading-loose text-gray-500 lg:mt-8 lg:text-start xl:text-base">
        {t("form-remember-password") || "Remember your password?"}{" "}
        <Link href={routes.auth.signIn} className="font-bold text-gray-700 transition-colors hover:text-[#1f502a]">
          {tAuth("auth-sign-in")}
        </Link>
      </Text>
    </>
  );
}

// Step 2 Component
function VerifyCodeForm({
  onSubmit,
  isLoading,
  identifier,
  countdown,
  onResend,
  onBack,
  t,
  tAuth,
}: {
  onSubmit: SubmitHandler<VerifyFormValues>;
  isLoading: boolean;
  identifier: string;
  countdown: number;
  onResend: () => void;
  onBack: () => void;
  t: any;
  tAuth: any;
}) {
  const { setValue, handleSubmit } = useForm<VerifyFormValues>();

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="pt-1.5">
        <div className="space-y-6">
          <Text className="text-sm text-gray-600">
            {tAuth("auth-code-sent-to") || "We sent a reset code to"}{" "}
            <span className="font-semibold text-gray-900">{identifier}</span>
          </Text>

          <PinCode
            variant="outline"
            setValue={(value) => setValue("code", String(value))}
            size="lg"
            className="lg:justify-start"
            length={6}
          />

          <Button className="mt-2 w-full" type="submit" size="lg" isLoading={isLoading}>
            {t("form-verify-code") || "Verify Code"}
          </Button>

          <div className="flex flex-col items-center gap-2 lg:flex-row lg:justify-between">
            <Button type="button" variant="text" className="p-0 text-sm text-gray-500 underline" onClick={onBack}>
              {t("form-back") || "Back"}
            </Button>
            <Button
              type="button"
              variant="text"
              className="p-0 text-sm font-medium text-primary underline"
              onClick={onResend}
              disabled={countdown > 0 || isLoading}
            >
              {countdown > 0 ? `${tAuth("auth-resend-in") || "Resend in"} ${countdown}s` : t("form-resend-otp")}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}

// Step 3 Component
function ResetPasswordForm({
  onSubmit,
  isLoading,
  t,
  tAuth,
}: {
  onSubmit: SubmitHandler<ResetFormValues>;
  isLoading: boolean;
  t: any;
  tAuth: any;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>();

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="pt-1.5">
        <div className="space-y-6">
          <Password
            label={t("form-new-password") || "New Password"}
            placeholder={t("form-enter-new-password") || "Enter your new password"}
            size="lg"
            className="[&>label>span]:font-medium"
            inputClassName="text-sm"
            {...register("newPassword", {
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
            })}
            error={errors.newPassword?.message}
            disabled={isLoading}
          />
          <Password
            label={t("form-confirm-password") || "Confirm Password"}
            placeholder={t("form-confirm-new-password") || "Confirm your new password"}
            size="lg"
            className="[&>label>span]:font-medium"
            inputClassName="text-sm"
            {...register("confirmPassword", { required: "Please confirm your password" })}
            error={errors.confirmPassword?.message}
            disabled={isLoading}
          />
          <Button className="mt-2 w-full" type="submit" size="lg" isLoading={isLoading}>
            {t("form-reset-password")}
          </Button>
        </div>
      </form>
      <Text className="mt-6 text-center text-[15px] leading-loose text-gray-500 lg:mt-8 lg:text-start xl:text-base">
        {t("form-remember-password") || "Remember your password?"}{" "}
        <Link href={routes.auth.signIn} className="font-bold text-gray-700 transition-colors hover:text-[#1f502a]">
          {tAuth("auth-sign-in")}
        </Link>
      </Text>
    </>
  );
}
