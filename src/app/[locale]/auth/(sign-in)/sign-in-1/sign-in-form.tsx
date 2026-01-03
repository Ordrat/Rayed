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
import { isSupportAgent, isAdmin } from "@/services/support.service";

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

  // Check if user needs to reset password on session update
  useEffect(() => {
    if (status === "authenticated" && session?.user?.needsPasswordReset) {
      // Redirect to reset password page
      router.push(routes.auth.forgotPassword1);
    } else if (status === "authenticated" && !session?.user?.needsPasswordReset) {
      // Determine redirect based on role
      const userRoles = session?.user?.roles || [];
      
      if (isSupportAgent(userRoles) && !isAdmin(userRoles)) {
        // Support agents go to support dashboard
        router.push(routes.supportDashboard.home);
      } else {
        // Admins and other roles go to main dashboard
        router.push("/");
      }
    }
  }, [session, status, router]);

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
        // The useEffect will handle redirection based on needsPasswordReset and role
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
              label="Email or Phone"
              placeholder="Enter your email or phone number"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("emailOrPhone")}
              error={errors.emailOrPhone?.message}
              disabled={isLoading}
            />
            <Password
              label="Password"
              placeholder="Enter your password"
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
                label="Remember Me"
                variant="flat"
                className="[&>label>span]:font-medium"
                disabled={isLoading}
              />
              <Link
                href={routes.auth.forgotPassword1}
                className="h-auto p-0 text-sm font-semibold text-blue underline transition-colors hover:text-gray-900 hover:no-underline"
              >
                Forget Password?
              </Link>
            </div>
            <Button
              className="w-full"
              type="submit"
              size="lg"
              isLoading={isLoading}
            >
              <span>Sign in</span> <PiArrowRightBold className="ms-2 mt-0.5 h-6 w-6" />
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
          Sign Up
        </Link>
      </Text>
    </>
  );
}
