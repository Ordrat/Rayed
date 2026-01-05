import SellerSignUpForm from "./seller-signup-form";
import AuthWrapperFour from "@/app/shared/auth-layout/auth-wrapper-four";
import { metaObject } from "@/config/site.config";

export const metadata = {
  ...metaObject("Seller Sign Up"),
};

export default function SellerSignUp() {
  return (
    <AuthWrapperFour
      title={
        <>
          Become a Seller
          <br />
          Grow Your Business
        </>
      }
    >
      <SellerSignUpForm />
    </AuthWrapperFour>
  );
}
