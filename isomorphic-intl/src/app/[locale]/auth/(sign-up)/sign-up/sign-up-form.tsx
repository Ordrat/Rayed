"use client";

import { Link } from "@/i18n/routing";
import { useState } from "react";
import { SubmitHandler } from "react-hook-form";
import { PiArrowRightBold, PiCarDuotone, PiStorefrontDuotone } from "react-icons/pi";
import { Password, Checkbox, Button, Input, Text } from "rizzui";
import { Form } from "@core/ui/form";
import { routes } from "@/config/routes";
import { SignUpSchema, signUpSchema } from "@/validators/signup.schema";
import { useTranslations } from "next-intl";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  isAgreed: false,
};

export default function SignUpForm() {
  const t = useTranslations("form");
  const [reset, setReset] = useState({});

  const onSubmit: SubmitHandler<SignUpSchema> = (data) => {
    console.log(data);
    setReset({ ...initialValues, isAgreed: false });
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
          <div className="flex flex-col gap-x-4 gap-y-5 md:grid md:grid-cols-2 lg:gap-5">
            <Input
              type="text"
              size="lg"
              label={t("form-first-name")}
              placeholder={t("form-first-name-placeholder")}
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("firstName")}
              error={errors.firstName?.message}
            />
            <Input
              type="text"
              size="lg"
              label={t("form-last-name")}
              placeholder={t("form-last-name-placeholder")}
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("lastName")}
              error={errors.lastName?.message}
            />
            <Input
              type="email"
              size="lg"
              label={t("form-email")}
              className="col-span-2 [&>label>span]:font-medium"
              inputClassName="text-sm"
              placeholder={t("form-email-placeholder")}
              {...register("email")}
              error={errors.email?.message}
            />
            <Password
              label={t("form-password")}
              placeholder={t("form-password-placeholder")}
              size="lg"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("password")}
              error={errors.password?.message}
            />
            <Password
              label={t("form-confirm-password")}
              placeholder={t("form-confirm-password-placeholder")}
              size="lg"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
            <div className="col-span-2 flex items-start ">
              <Checkbox
                {...register("isAgreed")}
                className="[&>label>span]:font-medium [&>label]:items-start"
                label={
                  <>
                    {t("form-signup-agreement")}{" "}
                    <Link
                      href="/"
                      className="font-medium text-blue transition-colors hover:underline"
                    >
                      {t("form-terms")}
                    </Link>{" "}
                    &{" "}
                    <Link
                      href="/"
                      className="font-medium text-blue transition-colors hover:underline"
                    >
                      {t("form-privacy-policy")}
                    </Link>
                  </>
                }
              />
            </div>
            <Button
              size="lg"
              type="submit"
              className="col-span-2 mt-2"
            >
              <span>{t("form-get-started")}</span> <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5 rtl:rotate-180" />
            </Button>
          </div>
        )}
      </Form>
      <div className="mt-6 text-center leading-loose text-gray-500 lg:mt-8 lg:text-start">
        <Text className="mb-2">
          {t("form-already-have-an-account")}{" "}
          <Link
            href={routes.auth.signIn}
            className="font-semibold text-gray-700 transition-colors hover:text-blue"
          >
            {t("form-sign-in")}
          </Link>
        </Text>
        
        <Text className="mt-4 mb-2 font-medium">{t("form-want-to-partner-with-us")}</Text>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
          <Link href={routes.auth.driverSignUp}>
            <Button
              className="w-full bg-red-600 hover:bg-red-700 sm:w-auto"
              rounded="pill"
            >
              <PiCarDuotone className="me-2 h-5 w-5 rtl:ms-2 rtl:me-0" />
              {t("form-sign-up-as-driver")}
            </Button>
          </Link>
          <Link href={routes.auth.sellerSignUp}>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 sm:w-auto"
              rounded="pill"
            >
              <PiStorefrontDuotone className="me-2 h-5 w-5 rtl:ms-2 rtl:me-0" />
              {t("form-sign-up-as-seller")}
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
