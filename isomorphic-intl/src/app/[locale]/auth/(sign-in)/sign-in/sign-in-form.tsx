"use client";

import { Link } from "@/i18n/routing";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { SubmitHandler } from "react-hook-form";
import { PiArrowRightBold} from "react-icons/pi";
import { Checkbox, Password, Button, Input, Text } from "rizzui";
import { Form } from "@core/ui/form";
import { routes } from "@/config/routes";
import { loginSchema, LoginSchema } from "@/validators/login.schema";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { isSupportAgent, isAdmin, changeSupportStatus } from "@/services/support.service";
import { SupportStatus } from "@/types/support.types";

const initialValues: LoginSchema = {
  emailOrPhone: "",
  password: "",
  rememberMe: false,
};

// Map error codes to translation keys
const ERROR_CODE_MAP: Record<string, string> = {
  "ACCOUNT_PENDING_APPROVAL": "form-error-account-pending-approval",
  "ACCOUNT_SUSPENDED": "form-error-account-suspended",
};

export default function SignInForm() {
  const t = useTranslations("form");
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [hasProcessedLogin, setHasProcessedLogin] = useState(false);

  // Translate error codes to localized messages
  const getTranslatedError = (error: string): string => {
    const translationKey = ERROR_CODE_MAP[error];
    if (translationKey) {
      return t(translationKey);
    }
    // Return original error if no translation found
    return error;
  };

  // Handle post-login redirect logic
  useEffect(() => {
    const handlePostLogin = async () => {
      if (status !== "authenticated" || !session || hasProcessedLogin) return;
      
      const userId = session?.user?.id;
      if (!userId) return;

      setHasProcessedLogin(true);

      // Update status to Online if applicable (for support agents)
      if (session?.accessToken && session?.user?.id) {
        const userRoles = session?.user?.roles || [];
        const isSupportRole = userRoles.some(
          (role) => role.toLowerCase() === 'support' || role.toLowerCase() === 'supportagent'
        );

        if (isSupportRole) {
          try {
            await changeSupportStatus(
              {
                supportId: userId,
                status: SupportStatus.ONLINE,
              },
              session.accessToken
            );
            console.log("User status updated to Online");
          } catch (error) {
            console.error("Failed to update status:", error);
            // Don't block login if status update fails
          }
        }
      }

      // Redirect to home/dashboard
      router.push("/");
    };

    handlePostLogin();
  }, [session, status, router, hasProcessedLogin]);

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        emailOrPhone: data.emailOrPhone,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(getTranslatedError(result.error));
        setIsLoading(false);
      } else if (result?.ok) {
        toast.success("Login successful!");
        // The useEffect will handle redirection
      }
    } catch (error) {
      toast.error("An error occurred during login");
      setIsLoading(false);
    }
  };


  return (
    <>
      <Form<LoginSchema>
        validationSchema={loginSchema}
        onSubmit={onSubmit}
        useFormProps={{
          mode: "onChange",
          defaultValues: initialValues,
        }}
      >
        {({ register, formState: { errors } }) => (
          <div className="space-y-5">
            <Input
              type="text"
              size="lg"
              label={t("form-email")}
              placeholder={t("form-email-placeholder")}
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("emailOrPhone")}
              error={errors.emailOrPhone?.message}
              disabled={isLoading}
            />
            <Password
              label={t("form-password")}
              placeholder={t("form-password-placeholder")}
              size="lg"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("password")}
              error={errors.password?.message}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between pb-2">
              <Checkbox
                {...register("rememberMe")}
                label={t("form-remember-me")}
                variant="flat"
                className="[&>label>span]:font-medium"
                disabled={isLoading}
              />
              <Link
                href={routes.auth.forgotPassword1}
                className="h-auto p-0 text-sm font-semibold text-[#043ABA] underline transition-colors hover:text-gray-900 hover:no-underline"
              >
                {t("form-forget-password")}
              </Link>
            </div>
            <Button
              className="w-full"
              type="submit"
              size="lg"
              rounded="pill"
              isLoading={isLoading}
            >
              <span>{t("form-sign-in")}</span> <PiArrowRightBold className="ms-2 mt-0.5 h-6 w-6 rtl:rotate-180" />
            </Button>
          </div>
        )}
      </Form>
      {/* <div className="mt-6 text-center leading-loose text-gray-500 lg:mt-8 lg:text-start">
        <Text className="mb-2">{t("form-dont-have-an-account")}</Text>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
          <Link href={routes.auth.driverSignUp}>
            <Button
              className="w-full bg-red-600 hover:bg-red-700 sm:w-auto"
              rounded="pill"
            >
              <PiCarDuotone className="me-2 h-5 w-5" />
              Sign up as Driver
            </Button>
          </Link>
          <Link href={routes.auth.sellerSignUp}>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 sm:w-auto"
              rounded="pill"
            >
              <PiStorefrontDuotone className="me-2 h-5 w-5" />
              Sign up as Seller
            </Button>
          </Link>
        </div>
      </div> */}
    </>
  );
}
