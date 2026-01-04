"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { SubmitHandler } from "react-hook-form";
import { PiArrowRightBold, PiCheckCircleBold } from "react-icons/pi";
import { Password, Button, Text, Title } from "rizzui";
import { Form } from "@core/ui/form";
import { routes } from "@/config/routes";
import { changePassword } from "@/services/auth.service";
import { useRouter } from "@/i18n/routing";
import toast from "react-hot-toast";
import { z } from "zod";

const setPasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SetPasswordSchema = z.infer<typeof setPasswordSchema>;

const initialValues: SetPasswordSchema = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function SetPasswordForm() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit: SubmitHandler<SetPasswordSchema> = async (data) => {
    setIsLoading(true);
    try {
      await changePassword(
        {
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        },
        session?.accessToken || ""
      );

      // Update the session to reflect that password reset is no longer needed
      await update({
        ...session,
        user: {
          ...session?.user,
          needsPasswordReset: false,
        },
      });

      setIsSuccess(true);
      toast.success("Password changed successfully!");

      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        const userRoles = session?.user?.roles || [];
        const isSupportRole = userRoles.some(
          (role) =>
            role.toLowerCase() === "support" ||
            role.toLowerCase() === "supportagent"
        );
        const isAdminRole = userRoles.some(
          (role) =>
            role.toLowerCase() === "admin" ||
            role.toLowerCase() === "administrator" ||
            role.toLowerCase() === "owner"
        );

        if (isSupportRole && !isAdminRole) {
          router.push(routes.supportDashboard.home);
        } else {
          router.push("/");
        }
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <PiCheckCircleBold className="mb-4 h-16 w-16 text-green-500" />
        <Title as="h3" className="mb-2 text-xl font-semibold">
          Password Changed Successfully!
        </Title>
        <Text className="text-gray-500">
          Redirecting you to the dashboard...
        </Text>
      </div>
    );
  }

  return (
    <>
      <div className="mb-7 text-center md:text-start">
        <Title as="h4" className="mb-2 text-lg font-semibold text-gray-900">
          Set Your New Password
        </Title>
        <Text className="text-gray-500">
          For security reasons, please change password to continue.
        </Text>
      </div>

      <Form<SetPasswordSchema>
        validationSchema={setPasswordSchema}
        onSubmit={onSubmit}
        useFormProps={{
          mode: "onChange",
          defaultValues: initialValues,
        }}
      >
        {({ register, formState: { errors } }) => (
          <div className="space-y-5">
            <Password
              label="Current Password"
              placeholder="Enter your current password"
              size="lg"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("oldPassword")}
              error={errors.oldPassword?.message}
              disabled={isLoading}
            />
            <Password
              label="New Password"
              placeholder="Enter your new password"
              size="lg"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("newPassword")}
              error={errors.newPassword?.message}
              disabled={isLoading}
            />
            <Password
              label="Confirm New Password"
              placeholder="Confirm your new password"
              size="lg"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
              disabled={isLoading}
            />
            <div className="mt-2 text-sm text-gray-500">
              <Text className="font-medium">Password requirements:</Text>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li>At least 8 characters</li>
                <li>At least one uppercase letter</li>
                <li>At least one lowercase letter</li>
                <li>At least one number</li>
              </ul>
            </div>
            <Button
              className="mt-6 w-full"
              type="submit"
              size="lg"
              isLoading={isLoading}
            >
              <span>Change Password</span>{" "}
              <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
            </Button>
          </div>
        )}
      </Form>
    </>
  );
}
