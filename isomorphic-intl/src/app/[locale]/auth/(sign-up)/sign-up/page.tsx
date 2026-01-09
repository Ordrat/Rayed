import SignUpForm from "./sign-up-form";
import AuthWrapperFour from "@/app/shared/auth-layout/auth-wrapper-four";
import { metaObject } from "@/config/site.config";
import { useTranslations } from "next-intl";

export const metadata = {
  ...metaObject("Sign Up"),
};

export default function SignUp() {
  const t = useTranslations("auth");
  return (
    <AuthWrapperFour
      title={
        <>
          {t("auth-join-us-today")}
          <br />
          {t("auth-create-your-account")}
        </>
      }
    >
      <SignUpForm />
    </AuthWrapperFour>
  );
}
