import DriverSignUpForm from "./driver-signup-form";
import AuthWrapperFour from "@/app/shared/auth-layout/auth-wrapper-four";
import { metaObject } from "@/config/site.config";
import { useTranslations } from "next-intl";

export const metadata = {
  ...metaObject("Driver Sign Up"),
};

export default function DriverSignUp() {
  const t = useTranslations("auth");
  return (
    <AuthWrapperFour
      title={
        <>
          {t("auth-become-a-driver")}
          <br />
          {t("auth-start-earning-today")}
        </>
      }
    >
      <DriverSignUpForm />
    </AuthWrapperFour>
  );
}
