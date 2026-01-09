"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { SubmitHandler } from "react-hook-form";
import {
  Title,
  Text,
  Button,
  Input,
  Password,
  Select,
  Loader,
  ActionIcon,
  Tooltip,
} from "rizzui";
import { PiShuffleBold, PiCheckCircleBold, PiUploadBold, PiTrashBold } from "react-icons/pi";
import { Form } from "@core/ui/form";
import Upload from "@core/ui/upload";

import { routes } from "@/config/routes";
import { adminRegisterDriver, createDriverDocument } from "@/services/driver.service";
import { VehicleType, DriverDocumentType } from "@/types/driver.types";
import {
  registerDriverSchema,
  RegisterDriverSchema,
} from "@/validators/driver.schema";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Image from "next/image";

const pageHeader = {
  title: "Create Driver",
  breadcrumb: [
    { name: "Home", href: "/" },
    { name: "Admin", href: "#" },
    { name: "Drivers", href: routes.drivers.list },
    { name: "Create" },
  ],
};

const vehicleTypeOptions = [
  { value: VehicleType.MOTORCYCLE, label: "Motorcycle" },
  { value: VehicleType.CAR, label: "Car" },
  { value: VehicleType.BICYCLE, label: "Bicycle" },
  { value: VehicleType.VAN, label: "Van" },
];

// Required documents for drivers
const requiredDocuments = [
  { type: DriverDocumentType.PERSONAL_PHOTO, label: "Personal Photo" },
  { type: DriverDocumentType.PERSONAL_VERIFICATION_CARD_FRONT, label: "ID Card (Front)" },
  { type: DriverDocumentType.PERSONAL_VERIFICATION_CARD_BACK, label: "ID Card (Back)" },
  { type: DriverDocumentType.DRIVING_LICENSE, label: "Driving License" },
  { type: DriverDocumentType.VEHICLE_REGISTRATION, label: "Vehicle Registration" },
];

const initialValues: RegisterDriverSchema = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  vehicleType: VehicleType.CAR,
};

interface DocumentUpload {
  type: DriverDocumentType;
  file: File | null;
  expiresAt: Date | null;
}

export default function CreateDriverPage() {
  const t = useTranslations("form");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"info" | "documents" | "success">("info");
  const [driverId, setDriverId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentUpload[]>(
    requiredDocuments.map((doc) => ({
      type: doc.type,
      file: null,
      expiresAt: null,
    }))
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [session, status, router]);

  const handleFileChange = (docType: DriverDocumentType, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setDocuments((prev) =>
      prev.map((doc) => (doc.type === docType ? { ...doc, file } : doc))
    );
  };

  const handleExpiryChange = (docType: DriverDocumentType, date: Date | null) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.type === docType ? { ...doc, expiresAt: date } : doc))
    );
  };

  const handleRemoveFile = (docType: DriverDocumentType) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.type === docType ? { ...doc, file: null } : doc))
    );
  };

  const onSubmit: SubmitHandler<RegisterDriverSchema> = async (data) => {
    setIsLoading(true);
    try {
      const driver = await adminRegisterDriver(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          password: data.password,
          vehicleType: data.vehicleType,
        },
        session?.accessToken || ""
      );
      setDriverId(driver.id);
      toast.success("Driver account created! Now upload documents.");
      setStep("documents");
    } catch (error: any) {
      console.error("RegisterDriver error:", error);
      const errorMessage = error.details?.detail || error.details?.title || error.message || "Failed to create driver";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentSubmit = async () => {
    if (!driverId) {
      toast.error("Driver ID not found");
      return;
    }

    const docsWithFiles = documents.filter((doc) => doc.file);
    if (docsWithFiles.length === 0) {
      toast.error("Please upload at least one document");
      return;
    }

    setIsLoading(true);
    try {
      for (const doc of docsWithFiles) {
        if (doc.file) {
          const formData = new FormData();
          formData.append("DriverId", driverId);
          formData.append("DocumentType", doc.type.toString());
          formData.append("Document", doc.file);
          if (doc.expiresAt) {
            formData.append("ExpiresAt", doc.expiresAt.toISOString());
          }

          await createDriverDocument(formData, session?.accessToken || "");
        }
      }
      toast.success("Documents uploaded successfully!");
      setStep("success");
    } catch (error: any) {
      console.error("Document upload error:", error);
      toast.error(error.message || "Failed to upload documents");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  // Success Step
  if (step === "success") {
    return (
      <>
        <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} isStaticTitle />
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <PiCheckCircleBold className="h-8 w-8 text-green-600" />
          </div>
          <Title as="h3" className="mb-2 text-xl font-semibold">
            Driver Created Successfully!
          </Title>
          <Text className="mb-6 text-gray-500">
            The driver account has been created and documents uploaded. The documents are pending review.
          </Text>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push(routes.drivers.list)}>
              View All Drivers
            </Button>
            <Button
              className="bg-[#1f502a] hover:bg-[#143219]"
              onClick={() => {
                setStep("info");
                setDriverId(null);
                setDocuments(
                  requiredDocuments.map((doc) => ({
                    type: doc.type,
                    file: null,
                    expiresAt: null,
                  }))
                );
              }}
            >
              Create Another Driver
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Document Upload Step
  if (step === "documents") {
    return (
      <>
        <PageHeader title="Upload Driver Documents" breadcrumb={pageHeader.breadcrumb} isStaticTitle />
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6">
            <Title as="h3" className="mb-2 text-xl font-semibold">
              Upload Documents
            </Title>
            <Text className="text-gray-500">
              Upload the required documents for verification. Documents with expiry dates should have the expiry date set.
            </Text>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {requiredDocuments.map((docInfo) => {
              const doc = documents.find((d) => d.type === docInfo.type);
              const isExpiryRequired = [
                DriverDocumentType.DRIVING_LICENSE,
                DriverDocumentType.VEHICLE_REGISTRATION,
              ].includes(docInfo.type);

              return (
                <div
                  key={docInfo.type}
                  className="rounded-lg border border-gray-200 p-4 dark:border-gray-600"
                >
                  <Text className="mb-3 font-medium">{docInfo.label} *</Text>
                  <div className="flex flex-col gap-4">
                    <div>
                      {doc?.file ? (
                        <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-600">
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                            {doc.file.type.includes("image") ? (
                              <Image
                                src={URL.createObjectURL(doc.file)}
                                fill
                                className="object-cover"
                                alt={docInfo.label}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                                PDF
                              </div>
                            )}
                          </div>
                          <div className="flex-1 truncate">
                            <Text className="truncate text-sm font-medium">
                              {doc.file.name}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              {(doc.file.size / 1024).toFixed(1)} KB
                            </Text>
                          </div>
                          <ActionIcon
                            size="sm"
                            variant="flat"
                            color="danger"
                            onClick={() => handleRemoveFile(docInfo.type)}
                          >
                            <PiTrashBold className="h-4 w-4" />
                          </ActionIcon>
                        </div>
                      ) : (
                        <Upload
                          accept="imgAndPdf"
                          onChange={(e) => handleFileChange(docInfo.type, e)}
                          className="min-h-[120px]"
                          iconClassName="w-16 h-16"
                          placeholderText={
                            <div className="text-center">
                              <Text className="text-sm font-medium">
                                Drop or select file
                              </Text>
                              <Text className="text-xs text-gray-500">
                                PNG, JPG, or PDF
                              </Text>
                            </div>
                          }
                        />
                      )}
                    </div>

                    {isExpiryRequired && (
                      <div>
                        <Text className="mb-2 text-sm text-gray-600">
                          Expiry Date
                        </Text>
                        <Input
                          type="date"
                          placeholder="Select expiry date"
                          value={
                            doc?.expiresAt
                              ? doc.expiresAt.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            handleExpiryChange(docInfo.type, e.target.valueAsDate)
                          }
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end border-t border-gray-200 pt-6 dark:border-gray-700">
            <Button
              type="button"
              className="w-full md:w-auto bg-[#1f502a] hover:bg-[#143219]"
              onClick={handleDocumentSubmit}
              isLoading={isLoading}
            >
              <PiUploadBold className="me-1.5 h-4 w-4" />
              Upload Documents
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Info Step (Form)
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} isStaticTitle />

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1f502a] text-white">1</div>
            <Text className="font-medium">Step 1: Driver Information</Text>
            <div className="ml-4 h-1 flex-1 bg-gray-200"></div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500">2</div>
            <Text className="text-gray-500">Documents</Text>
          </div>
          <Title as="h3" className="mb-2 text-xl font-semibold">
            Driver Information
          </Title>
          <Text className="text-gray-500">
            Enter the driver&apos;s basic information. After this, you&apos;ll upload their documents.
          </Text>
        </div>

        <Form<RegisterDriverSchema>
          validationSchema={registerDriverSchema(t)}
          onSubmit={onSubmit}
          useFormProps={{
            mode: "onChange",
            defaultValues: initialValues,
          }}
        >
          {({ register, formState: { errors }, setValue, watch }) => (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="First Name"
                  placeholder="Enter first name"
                  {...register("firstName")}
                  error={errors.firstName?.message}
                  disabled={isLoading}
                />
                <Input
                  label="Last Name"
                  placeholder="Enter last name"
                  {...register("lastName")}
                  error={errors.lastName?.message}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  type="email"
                  label="Email"
                  placeholder="Enter email address"
                  {...register("email")}
                  error={errors.email?.message}
                  disabled={isLoading}
                />

                <Input
                  label="Phone Number"
                  placeholder="Enter phone number"
                  {...register("phoneNumber")}
                  error={errors.phoneNumber?.message}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <Text className="font-medium text-gray-900 dark:text-gray-100">
                      Initial Password
                    </Text>
                    <Tooltip
                      size="sm"
                      content="Generate Random Password"
                      placement="top"
                      className="z-[1000]"
                    >
                      <ActionIcon
                        variant="text"
                        size="sm"
                        className="h-6 w-6 text-primary transition-colors hover:bg-primary/10 hover:text-primary-dark"
                        onClick={() => {
                          const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                          const lowercase = "abcdefghijklmnopqrstuvwxyz";
                          const numbers = "0123456789";
                          const allChars = uppercase + lowercase + numbers;
                          
                          let password = "";
                          password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
                          password += numbers.charAt(Math.floor(Math.random() * numbers.length));
                          for (let i = 0; i < 10; i++) {
                            password += allChars.charAt(Math.floor(Math.random() * allChars.length));
                          }
                          password = password.split("").sort(() => 0.5 - Math.random()).join("");
                          setValue("password", password, { shouldValidate: true });
                        }}
                      >
                        <PiShuffleBold className="h-6 w-6" />
                      </ActionIcon>
                    </Tooltip>
                  </div>
                  <Password
                    placeholder="Enter initial password"
                    {...register("password")}
                    error={errors.password?.message}
                    disabled={isLoading}
                  />
                </div>

                <Select
                  label="Vehicle Type"
                  options={vehicleTypeOptions}
                  value={vehicleTypeOptions.find((opt) => opt.value === watch("vehicleType"))}
                  onChange={(option: any) => setValue("vehicleType", option?.value ?? VehicleType.CAR)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(routes.drivers.list)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#1f502a] hover:bg-[#143219]"
                  isLoading={isLoading}
                >
                  Next: Upload Documents
                </Button>
              </div>
            </div>
          )}
        </Form>
      </div>
    </>
  );
}
