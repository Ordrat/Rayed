import SellerSignUpForm from "./seller-signup-form";
import AuthWrapperFour from "@/app/shared/auth-layout/auth-wrapper-four";
import { metaObject } from "@/config/site.config";
import { useTranslations } from "next-intl";

export const metadata = {
  ...metaObject("Seller Sign Up"),
};

export default function SellerSignUp() {
  const t = useTranslations("auth");
  return (
    <AuthWrapperFour
      title={
        <>
          {t("auth-become-a-seller")}
          <br />
          {t("auth-grow-your-business")}
        </>
      }
    >
      <SellerSignUpForm />
    </AuthWrapperFour>
  );
}
