"use client";

import { useState, useEffect } from "react";
import { PinCode, Button, Text } from "rizzui";
import { Form } from "@core/ui/form";
import { SubmitHandler } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { verifyAccount, resendVerificationCode } from "@/services/auth.service";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

type FormValues = {
  otp: string;
};

export default function OtpForm() {
  const t = useTranslations("form");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Get email/phone from URL params (passed from signup)
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const identifier = email || phone || "";

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!identifier) {
      toast.error("Missing email or phone number");
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyAccount({
        phoneNumberOrEmail: identifier,
        verificationCode: data.otp,
      });

      // Sign in the user with the returned tokens
      const result = await signIn("credentials", {
        redirect: false,
        email: response.email,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        accessTokenExpiration: response.accessTokenExpirationDate,
        refreshTokenExpiration: response.refreshTokenExpirationDate,
        firstName: response.firstName,
        lastName: response.lastName,
        phoneNumber: response.phoneNumber,
        roles: JSON.stringify(response.roles),
        id: response.id,
      });

      if (result?.ok) {
        toast.success(tAuth("auth-account-verified-success") || "Account verified successfully!");
        router.push("/");
      } else {
        toast.error("Failed to sign in after verification");
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!identifier || countdown > 0) return;

    setIsResending(true);
    try {
      await resendVerificationCode({
        email: email || undefined,
        phoneNumber: phone || undefined,
      });
      toast.success(tAuth("auth-code-resent-success") || "Verification code resent!");
      setCountdown(60);
    } catch (error: any) {
      if (error.message?.includes("429") || error.message?.includes("Too Many")) {
        toast.error(tAuth("auth-too-many-requests") || "Too many requests. Please wait.");
        setCountdown(120);
      } else {
        toast.error(error.message || "Failed to resend code");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Form<FormValues> onSubmit={onSubmit}>
      {({ setValue }) => (
        <div className="space-y-5 lg:space-y-8">
          {identifier && (
            <Text className="pb-4 text-center text-sm text-gray-600">
              {tAuth("auth-code-sent-to") || "We sent a code to"}{" "}
              <span className="font-semibold text-gray-900">{identifier}</span>
            </Text>
          )}

          <PinCode
            variant="outline"
            setValue={(value) => setValue("otp", String(value))}
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
            onClick={handleResendCode}
            disabled={countdown > 0 || isResending}
            isLoading={isResending}
          >
            {countdown > 0
              ? `${tAuth("auth-resend-in") || "Resend in"} ${countdown}s`
              : t("form-resend-otp") || "Resend OTP"}
          </Button>
          <Button className="w-full text-base font-medium" type="submit" size="xl" rounded="lg" isLoading={isLoading}>
            {t("form-verify-otp") || "Verify OTP"}
          </Button>
        </div>
      )}
    </Form>
  );
}
