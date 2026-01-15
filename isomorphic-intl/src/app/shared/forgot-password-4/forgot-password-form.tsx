"use client";

import { Link, useRouter } from "@/i18n/routing";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button, Input, Text, PinCode, Password } from "rizzui";
import { useMedia } from "@core/hooks/use-media";
import { routes } from "@/config/routes";
import { forgotPassword, verifyResetCode, resetPassword } from "@/services/auth.service";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

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

export default function ForgetPasswordForm() {
  const t = useTranslations("form");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const { update } = useSession();
  const isMedium = useMedia("(max-width: 1200px)", false);

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
        toast.error(tAuth("auth-too-many-requests") || "Too many requests. Please wait.");
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
      const result = await verifyResetCode({
        phoneNumberOrEmail: identifier,
        resetCode: data.code,
      });

      console.log("Verify Response:", result);
      // Handle case where result might be an object { token: "..." } or similar
      let token = result;
      if (typeof result === "object" && result !== null) {
        // Try common property names
        token = (result as any).token || (result as any).resetToken || (result as any).result || JSON.stringify(result);
      }

      setResetToken(String(token));
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

      await update({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        accessTokenExpiration: response.accessTokenExpirationDate,
      });

      toast.success(tAuth("auth-password-reset-success") || "Password reset successful!");

      setTimeout(() => {
        router.push(routes.auth.signIn);
      }, 1000);
    } catch (error: any) {
      console.error("Reset Password Error:", error);

      let errorMessage = error.message || "Failed to reset password";

      // Handle ASP.NET Core validation errors (error.details is usually the response body)
      if (error.details?.errors) {
        // format: { "Password": ["Password too short"], "Token": ["Invalid token"] }
        const validationErrors = Object.values(error.details.errors).flat().join(", ");
        if (validationErrors) {
          errorMessage = validationErrors;
        }
      }

      toast.error(errorMessage);
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
    return (
      <RequestCodeForm onSubmit={handleRequestCode} isLoading={isLoading} isMedium={isMedium} t={t} tAuth={tAuth} />
    );
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
        isMedium={isMedium}
        t={t}
        tAuth={tAuth}
      />
    );
  }

  // Step 3: Reset Password Form
  return (
    <ResetPasswordForm onSubmit={handleResetPassword} isLoading={isLoading} isMedium={isMedium} t={t} tAuth={tAuth} />
  );
}

// Step 1 Component
function RequestCodeForm({
  onSubmit,
  isLoading,
  isMedium,
  t,
  tAuth,
}: {
  onSubmit: SubmitHandler<RequestFormValues>;
  isLoading: boolean;
  isMedium: boolean;
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <Input
            type="text"
            size={isMedium ? "lg" : "xl"}
            label={tAuth("auth-email-or-phone") || "Email or Phone"}
            placeholder={tAuth("auth-enter-email-or-phone") || "Enter your email or phone"}
            className="[&>label>span]:font-medium"
            {...register("identifier", { required: "This field is required" })}
            error={errors.identifier?.message}
            disabled={isLoading}
          />
          <Button className="w-full" type="submit" size={isMedium ? "lg" : "xl"} isLoading={isLoading} rounded="lg">
            {t("form-send-reset-code") || "Send Reset Code"}
          </Button>
        </div>
      </form>
      <Text className="mt-6 text-center text-[15px] leading-loose text-gray-500 md:mt-7 lg:mt-9 lg:text-base">
        {t("form-remember-password") || "Remember your password?"}{" "}
        <Link href={routes.auth.signIn} className="font-semibold text-gray-700 transition-colors hover:text-primary">
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
  isMedium,
  t,
  tAuth,
}: {
  onSubmit: SubmitHandler<VerifyFormValues>;
  isLoading: boolean;
  identifier: string;
  countdown: number;
  onResend: () => void;
  onBack: () => void;
  isMedium: boolean;
  t: any;
  tAuth: any;
}) {
  const { setValue, handleSubmit } = useForm<VerifyFormValues>();

  return (
    <>
      <Text className="pb-7 text-center text-[15px] leading-[1.85] text-gray-700 md:text-base md:!leading-loose lg:-mt-2">
        {tAuth("auth-code-sent-to") || "We sent a code to"}{" "}
        <span className="font-semibold text-gray-900">{identifier}</span>
      </Text>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-5 lg:space-y-8">
          <PinCode
            variant="outline"
            setValue={(value) => setValue("code", String(value))}
            className="pb-2"
            size="lg"
            length={6}
          />

          <Button
            className="w-full text-base font-medium"
            type="button"
            size="xl"
            variant="outline"
            rounded="lg"
            onClick={onResend}
            disabled={countdown > 0 || isLoading}
          >
            {countdown > 0
              ? `${tAuth("auth-resend-in") || "Resend in"} ${countdown}s`
              : t("form-resend-otp") || "Resend Code"}
          </Button>
          <Button className="w-full text-base font-medium" type="submit" size="xl" rounded="lg" isLoading={isLoading}>
            {t("form-verify-code") || "Verify Code"}
          </Button>
          <Button className="w-full text-base font-medium" type="button" size="xl" variant="text" onClick={onBack}>
            {t("form-back") || "Back"}
          </Button>
        </div>
      </form>
    </>
  );
}

// Step 3 Component
function ResetPasswordForm({
  onSubmit,
  isLoading,
  isMedium,
  t,
  tAuth,
}: {
  onSubmit: SubmitHandler<ResetFormValues>;
  isLoading: boolean;
  isMedium: boolean;
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <Password
            label={t("form-new-password") || "New Password"}
            placeholder={t("form-enter-new-password") || "Enter your new password"}
            size={isMedium ? "lg" : "xl"}
            className="[&>label>span]:font-medium"
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
            size={isMedium ? "lg" : "xl"}
            className="[&>label>span]:font-medium"
            {...register("confirmPassword", { required: "Please confirm your password" })}
            error={errors.confirmPassword?.message}
            disabled={isLoading}
          />
          <Button className="w-full" type="submit" size={isMedium ? "lg" : "xl"} isLoading={isLoading} rounded="lg">
            {t("form-reset-password") || "Reset Password"}
          </Button>
        </div>
      </form>
      <Text className="mt-6 text-center text-[15px] leading-loose text-gray-500 md:mt-7 lg:mt-9 lg:text-base">
        {t("form-remember-password") || "Remember your password?"}{" "}
        <Link href={routes.auth.signIn} className="font-semibold text-gray-700 transition-colors hover:text-primary">
          {tAuth("auth-sign-in")}
        </Link>
      </Text>
    </>
  );
}
