import SetPasswordForm from "./set-password-form";
import UnderlineShape from "@core/components/shape/underline";
import Image from "next/image";
import AuthWrapperOne from "@/app/shared/auth-layout/auth-wrapper-one";
import { useTranslations } from "next-intl";

export default function SetPasswordPage() {
  const t = useTranslations("auth");
  return (
    <AuthWrapperOne
      title={
        <>
          Set Your New{" "}
          <span className="relative inline-block">
            Password
            <UnderlineShape className="absolute -bottom-2 end-0 h-2.5 w-28 text-blue xl:-bottom-1.5 xl:w-36" />
          </span>
        </>
      }
      bannerTitle="Welcome to Your Dashboard"
      bannerDescription="Please set a new password to secure your account and continue using the platform."
      pageImage={
        <div className="relative mx-auto aspect-[4/3.37] w-[500px] xl:w-[620px] 2xl:w-[820px]">
          <Image
            src={"https://isomorphic-furyroad.s3.amazonaws.com/public/auth/sign-up.webp"}
            alt="Set Password Thumbnail"
            fill
            priority
            sizes="(max-width: 768px) 100vw"
            className="object-cover"
          />
        </div>
      }
    >
      <SetPasswordForm />
    </AuthWrapperOne>
  );
}
