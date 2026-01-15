"use client";

import { Link, useRouter } from "@/i18n/routing";
import { useState } from "react";
import { SubmitHandler } from "react-hook-form";
import { PiArrowRightBold } from "react-icons/pi";
import { Password, Checkbox, Button, Input, Text } from "rizzui";
import { Form } from "@core/ui/form";
import { routes } from "@/config/routes";
import { SignUpSchema, signUpSchema } from "@/validators/signup.schema";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { registerSeller, resendVerificationCode } from "@/services/auth.service";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  isAgreed: false,
};

export default function SignUpForm() {
  const t = useTranslations("form");
  const [reset, setReset] = useState({});

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<SignUpSchema> = async (data) => {
    setIsLoading(true);
    try {
      // Step 1: Register the seller
      await registerSeller({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
      });

      // Step 2: Explicitly send verification code to ensure user receives it
      try {
        await resendVerificationCode({
          email: data.email,
          phoneNumber: undefined,
        });
      } catch (codeError: any) {
        // If backend already sent code on registration, this might fail - that's okay
        console.log("Verification code send note:", codeError.message);
      }

      toast.success(t("form-signup-success") || "Account created successfully! Please verify your email.");

      // Redirect to verification page
      router.push(`${routes.auth.verifyAccount}?email=${encodeURIComponent(data.email)}`);

      setReset({ ...initialValues, isAgreed: false });
    } catch (error: any) {
      console.error("Signup Error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form<SignUpSchema>
        validationSchema={signUpSchema(t)}
        resetValues={reset}
        onSubmit={onSubmit}
        useFormProps={{
          defaultValues: initialValues,
        }}
      >
        {({ register, formState: { errors } }) => (
          <div className="flex flex-col gap-x-4 gap-y-4 md:grid md:grid-cols-2">
            <Input
              type="text"
              label={t("form-first-name")}
              placeholder={t("form-first-name-placeholder")}
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("firstName")}
              error={errors.firstName?.message}
            />
            <Input
              type="text"
              label={t("form-last-name")}
              placeholder={t("form-last-name-placeholder")}
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("lastName")}
              error={errors.lastName?.message}
            />
            <Input
              type="email"
              label={t("form-email")}
              className="col-span-2 [&>label>span]:font-medium"
              inputClassName="text-sm"
              placeholder={t("form-email-placeholder")}
              {...register("email")}
              error={errors.email?.message}
            />
            <Input
              type="tel"
              label={t("form-phone")}
              className="col-span-2 [&>label>span]:font-medium"
              inputClassName="text-sm"
              placeholder={t("form-phone-placeholder")}
              {...register("phoneNumber")}
              error={errors.phoneNumber?.message}
            />
            <Password
              label={t("form-password")}
              placeholder={t("form-password-placeholder")}
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("password")}
              error={errors.password?.message}
            />
            <Password
              label={t("form-confirm-password")}
              placeholder={t("form-confirm-password-placeholder")}
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
            <div className="col-span-2 flex items-start">
              <Checkbox
                {...register("isAgreed")}
                className="[&>label>span]:font-medium [&>label]:items-start"
                label={
                  <>
                    {t("form-signup-agreement")} <span className="font-medium text-gray-700">{t("form-terms")}</span> &{" "}
                    <span className="font-medium text-gray-700">{t("form-privacy-policy")}</span>
                  </>
                }
              />
            </div>
            <Button type="submit" className="col-span-2 mt-2" isLoading={isLoading}>
              <span>{t("form-get-started")}</span> <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5 rtl:rotate-180" />
            </Button>
          </div>
        )}
      </Form>
      <div className="mt-6 text-center leading-loose text-gray-500 lg:mt-8 lg:text-start">
        <Text className="mb-2">
          {t("form-already-have-an-account")}{" "}
          <Link href={routes.auth.signIn} className="font-semibold text-gray-700 transition-colors hover:text-blue">
            {t("form-sign-in")}
          </Link>
        </Text>
      </div>
    </>
  );
}
