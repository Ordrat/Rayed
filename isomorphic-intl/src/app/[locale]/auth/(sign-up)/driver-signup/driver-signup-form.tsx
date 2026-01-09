"use client";

import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button, Input, Password, Text, Select, Loader, Title } from "rizzui";
import { useRouter } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { registerDriver, createDriverDocument } from "@/services/driver.service";
import { VehicleType, DriverDocumentType } from "@/types/driver.types";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface DriverSignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  vehicleType: VehicleType;
}

const vehicleOptions = [
  { label: "Motorcycle", value: VehicleType.MOTORCYCLE },
  { label: "Car", value: VehicleType.CAR },
  { label: "Bicycle", value: VehicleType.BICYCLE },
  { label: "Van", value: VehicleType.VAN },
];

export default function DriverSignUpForm() {
  const t = useTranslations("form");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"form" | "documents" | "success">("form");
  const [driverId, setDriverId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<{ [key: number]: File | null }>({
    [DriverDocumentType.PERSONAL_VERIFICATION_CARD_FRONT]: null,
    [DriverDocumentType.DRIVING_LICENSE]: null,
    [DriverDocumentType.VEHICLE_REGISTRATION]: null,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DriverSignUpFormData>({
    defaultValues: {
      vehicleType: VehicleType.CAR,
    },
  });

  const password = watch("password");

  const onSubmit: SubmitHandler<DriverSignUpFormData> = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error(t("form-password-dont-match"));
      return;
    }

    setIsLoading(true);
    try {
      const driver = await registerDriver({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        vehicleType: data.vehicleType,
      });
      setDriverId(driver.id);
      setStep("documents");
      toast.success(t("form-account-created-upload-docs"));
    } catch (error: any) {
      toast.error(error.message || t("form-failed-create-account"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (docType: DriverDocumentType, file: File | null) => {
    setDocuments((prev) => ({ ...prev, [docType]: file }));
  };

  const handleDocumentSubmit = async () => {
    if (!driverId) return;

    const hasDocuments = Object.values(documents).some((f) => f !== null);
    if (!hasDocuments) {
      toast.error(t("form-at-least-one-doc"));
      return;
    }

    setIsLoading(true);
    try {
      for (const [docTypeStr, file] of Object.entries(documents)) {
        if (file) {
          const docType = parseInt(docTypeStr) as DriverDocumentType;
          const formData = new FormData();
          formData.append("DriverId", driverId);
          formData.append("DocumentType", docType.toString());
          formData.append("Document", file);

          await createDriverDocument(formData);
        }
      }
      setStep("success");
      toast.success(t("form-docs-uploaded-success"));
    } catch (error: any) {
      toast.error(error.message || t("form-failed-upload-docs"));
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <Title as="h3" className="mb-4 text-2xl font-bold text-green-600">
          {t("form-registration-complete")}
        </Title>
        <Text className="mb-6 text-gray-600">
          {t("form-registration-complete-description")}
        </Text>
        <Button onClick={() => router.push(routes.auth.signIn)}>
          {t("form-go-to-sign-in")}
        </Button>
      </div>
    );
  }

  if (step === "documents") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Title as="h3" className="mb-2 text-xl font-bold">
            {t("form-upload-your-documents")}
          </Title>
          <Text className="text-gray-500">
            {t("form-upload-documents-description")}
          </Text>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              {t("form-national-id")}
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) =>
                handleFileChange(
                  DriverDocumentType.PERSONAL_VERIFICATION_CARD_FRONT,
                  e.target.files?.[0] || null
                )
              }
              className="w-full rounded-lg border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              {t("form-drivers-license")}
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) =>
                handleFileChange(
                  DriverDocumentType.DRIVING_LICENSE,
                  e.target.files?.[0] || null
                )
              }
              className="w-full rounded-lg border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              {t("form-vehicle-registration")}
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) =>
                handleFileChange(
                  DriverDocumentType.VEHICLE_REGISTRATION,
                  e.target.files?.[0] || null
                )
              }
              className="w-full rounded-lg border border-gray-300 p-2"
            />
          </div>
        </div>

        <Button
          type="button"
          className="w-full rounded-full bg-[#1f502a] hover:bg-[#143219]"
          onClick={handleDocumentSubmit}
          disabled={isLoading}
        >
          {isLoading ? <Loader variant="spinner" /> : t("form-submit-documents")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="text"
          label={t("form-first-name")}
          placeholder={t("form-first-name-placeholder")}
          {...register("firstName", { required: t("form-first-name-required") })}
          error={errors.firstName?.message}
        />
        <Input
          type="text"
          label={t("form-last-name")}
          placeholder={t("form-last-name-placeholder")}
          {...register("lastName", { required: t("form-last-name-is-required") })}
          error={errors.lastName?.message}
        />
      </div>

      <Input
        type="email"
        label={t("form-email")}
        placeholder={t("form-email-placeholder")}
        {...register("email", {
          required: t("form-email-address-required"),
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: t("form-invalid-email-address"),
          },
        })}
        error={errors.email?.message}
      />

      <Input
        type="tel"
        label={t("form-phone-number")}
        placeholder={t("form-phone-placeholder")}
        {...register("phoneNumber", { required: t("form-phone-number-is-required") })}
        error={errors.phoneNumber?.message}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t("form-vehicle-type")}</label>
        <Select
          options={[
            { label: t("form-motorcycle"), value: VehicleType.MOTORCYCLE },
            { label: t("form-car"), value: VehicleType.CAR },
            { label: t("form-bicycle"), value: VehicleType.BICYCLE },
            { label: t("form-van"), value: VehicleType.VAN },
          ]}
          value={[
            { label: t("form-motorcycle"), value: VehicleType.MOTORCYCLE },
            { label: t("form-car"), value: VehicleType.CAR },
            { label: t("form-bicycle"), value: VehicleType.BICYCLE },
            { label: t("form-van"), value: VehicleType.VAN },
          ].find(
            (opt) => opt.value === watch("vehicleType")
          )}
          onChange={(option: any) => setValue("vehicleType", option.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Password
          label={t("form-password")}
          placeholder={t("form-password-placeholder")}
          {...register("password", {
            required: t("form-password-required"),
            minLength: {
              value: 8,
              message: t("form-password-helper-text"),
            },
          })}
          error={errors.password?.message}
        />

        <Password
          label={t("form-confirm-password")}
          placeholder={t("form-confirm-password-placeholder")}
          {...register("confirmPassword", {
            required: t("form-confirm-password-required"),
            validate: (value) => value === password || t("form-password-dont-match"),
          })}
          error={errors.confirmPassword?.message}
        />
      </div>

      <Button
        type="submit"
        className="w-full rounded-full bg-[#1f502a] hover:bg-[#143219]"
        disabled={isLoading}
      >
        {isLoading ? <Loader variant="spinner" /> : t("form-create-account")}
      </Button>
    </form>
  );
}
