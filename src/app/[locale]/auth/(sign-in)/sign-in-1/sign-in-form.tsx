"use client";

import { Link } from "@/i18n/routing";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { SubmitHandler } from "react-hook-form";
import { PiArrowRightBold } from "react-icons/pi";
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

export default function SignInForm() {
  const t = useTranslations("form");
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [hasProcessedLogin, setHasProcessedLogin] = useState(false);

  // Handle post-login redirect logic
  useEffect(() => {
    const handlePostLogin = async () => {
      if (status !== "authenticated" || !session || hasProcessedLogin) return;
      
      const userId = session?.user?.id;
      if (!userId) return;

      // Check localStorage for first-time login flag
      // If user hasn't changed their password yet, redirect to set-password
      const passwordChangedKey = `support_password_changed_${userId}`;
      const hasChangedPassword = typeof window !== 'undefined' 
        ? localStorage.getItem(passwordChangedKey) === 'true' 
        : false;
      
      if (!hasChangedPassword) {
        // First-time login - redirect to set password page immediately
        // DO NOT update status to Online yet - that happens after password change
        console.log("First-time login detected, redirecting to set password page");
        setHasProcessedLogin(true);
        router.push(routes.auth.setPassword);
        return;
      }

      // User has already changed password, proceed with normal login
      setHasProcessedLogin(true);

      // Update status to Online if applicable
      if (session?.accessToken) {
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
        toast.error(result.error);
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
              <span>{t("form-sign-in")}</span> <PiArrowRightBold className="ms-2 mt-0.5 h-6 w-6" />
            </Button>
          </div>
        )}
      </Form>
      <Text className="mt-6 text-center leading-loose text-gray-500 lg:mt-8 lg:text-start">
        {t("form-dont-have-an-account")}{" "}
        <Link
          href={routes.auth.signUp1}
          className="font-semibold text-gray-700 transition-colors hover:text-blue"
        >
          {t("form-sign-up")}
        </Link>
      </Text>
    </>
  );
}
