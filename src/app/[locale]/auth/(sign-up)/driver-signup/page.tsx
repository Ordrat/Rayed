import DriverSignUpForm from "./driver-signup-form";
import AuthWrapperFour from "@/app/shared/auth-layout/auth-wrapper-four";
import { metaObject } from "@/config/site.config";

export const metadata = {
  ...metaObject("Driver Sign Up"),
};

export default function DriverSignUp() {
  return (
    <AuthWrapperFour
      title={
        <>
          Become a Driver
          <br />
          Start Earning Today
        </>
      }
    >
      <DriverSignUpForm />
    </AuthWrapperFour>
  );
}
