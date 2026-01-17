import SignInForm from "./sign-in-form";
import AuthWrapperFour from "@/app/shared/auth-layout/auth-wrapper-four";
import { metaObject } from "@/config/site.config";
import { getTranslations } from "next-intl/server";

export const metadata = {
  ...metaObject("Sign In"),
};

export default async function SignIn() {
  const t = await getTranslations("auth");
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
