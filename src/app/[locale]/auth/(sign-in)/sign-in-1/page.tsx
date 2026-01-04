import SignInForm from "./sign-in-form";
import AuthWrapperFour from "@/app/shared/auth-layout/auth-wrapper-four";
import { metaObject } from "@/config/site.config";
import { useTranslations } from "next-intl";

export const metadata = {
  ...metaObject("Sign In 1"),
};

export default function SignIn() {
  const t = useTranslations("auth");
  return (
    <AuthWrapperFour
      title={
        <>
          {t("auth-welcome-back")}
          <br />
          {t("auth-sign-in-with-your-credentials")}
        </>
      }
    >
      <SignInForm />
    </AuthWrapperFour>
  );
}
