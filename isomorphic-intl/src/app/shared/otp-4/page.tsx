import AuthWrapperFour from "@/app/shared/auth-layout/auth-wrapper-four";
import { Text } from "rizzui/typography";
import OtpForm from "./otp-form";
import { useTranslations } from "next-intl";
import { Suspense } from "react";

function OtpContent() {
  const t = useTranslations("auth");
  return (
    <AuthWrapperFour title={t("auth-otp-verification")} className="md:px-14 lg:px-20">
      <Text className="pb-7 text-center text-[15px] leading-[1.85] text-gray-700 md:text-base md:!leading-loose lg:-mt-5">
        {t("auth-one-time-password")}
      </Text>
      <OtpForm />
    </AuthWrapperFour>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <OtpContent />
    </Suspense>
  );
}
