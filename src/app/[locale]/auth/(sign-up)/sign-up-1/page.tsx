import SignUpForm from "./sign-up-form";
import AuthWrapperFour from "@/app/shared/auth-layout/auth-wrapper-four";
import { metaObject } from "@/config/site.config";
import { useTranslations } from "next-intl";

export const metadata = {
  ...metaObject("Sign Up 1"),
};

export default function SignUp() {
  const t = useTranslations("auth");
  return (
    <AuthWrapperFour
      title={
        <>
          {t("auth-join-us-and-never-miss")} -{" "}
          <span className="relative inline-block">
            {t("auth-sign-up")}
          </span>
        </>
      }
      isSocialLoginActive={true}
    >
      <SignUpForm />
    </AuthWrapperFour>
  );
}
