import AuthWrapperFour from "@/app/shared/auth-layout/auth-wrapper-four";
import ForgetPasswordForm from "./forgot-password-form";
import { useTranslations } from "next-intl";

export default function ForgotPassword() {
  const t = useTranslations("auth");
  return (
    <AuthWrapperFour
      title={
        <>
          {t("auth-having-trouble-to-sign-in")} <br className="hidden sm:inline-block" />{" "}
          {t("auth-reset-your-password")}
        </>
      }
    >
      <ForgetPasswordForm />
    </AuthWrapperFour>
  );
}
