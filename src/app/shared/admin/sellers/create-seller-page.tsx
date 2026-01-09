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
  Loader,
  Tooltip,
  ActionIcon,
} from "rizzui";
import { PiShuffleBold, PiCheckCircleBold, PiUploadBold, PiTrashBold } from "react-icons/pi";
import DeletePopover from "@/app/shared/delete-popover";
import { Form } from "@core/ui/form";
import Upload from "@core/ui/upload";
import { routes } from "@/config/routes";
import { adminRegisterSeller, createSellerDocuments } from "@/services/seller.service";
import { SellerDocumentType } from "@/types/seller.types";
import {
  registerSellerSchema,
  RegisterSellerSchema,
} from "@/validators/seller.schema";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Image from "next/image";

const pageHeader = {
  title: "Create Seller",
  breadcrumb: [
    { name: "Home", href: "/" },
    { name: "Admin", href: "#" },
    { name: "Sellers", href: routes.sellers.list },
    { name: "Create" },
  ],
};

// Required documents for sellers
const requiredDocuments = [
  { type: SellerDocumentType.NATIONAL_ID, label: "National ID" },
  { type: SellerDocumentType.COMMERCIAL_REGISTER, label: "Commercial Register" },
  { type: SellerDocumentType.TAX_CARD, label: "Tax Card" },
];

const initialValues: RegisterSellerSchema = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  bankAccountNumber: "",
  bankName: "",
};

interface DocumentUpload {
  type: SellerDocumentType;
  file: File | null;
}

export default function CreateSellerPage() {
  const t = useTranslations("form");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"info" | "documents" | "success">("info");
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentUpload[]>(
    requiredDocuments.map((doc) => ({
      type: doc.type,
      file: null,
    }))
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [session, status, router]);

  const handleFileChange = (docType: SellerDocumentType, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setDocuments((prev) =>
      prev.map((doc) => (doc.type === docType ? { ...doc, file } : doc))
    );
  };

  const handleRemoveFile = (docType: SellerDocumentType) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.type === docType ? { ...doc, file: null } : doc))
    );
  };

  const onSubmit: SubmitHandler<RegisterSellerSchema> = async (data) => {
    setIsLoading(true);
    try {
      const seller = await adminRegisterSeller(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          password: data.password,
          bankAccountNumber: data.bankAccountNumber,
          bankName: data.bankName,
        },
        session?.accessToken || ""
      );
      setSellerId(seller.id);
      toast.success("Seller account created! Now upload documents.");
      setStep("documents");
    } catch (error: any) {
      console.error("RegisterSeller error:", error);
      const errorMessage = error.details?.detail || error.details?.title || error.message || "Failed to create seller";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentSubmit = async () => {
    if (!sellerId) {
      toast.error("Seller ID not found");
      return;
    }

    const missingDocs = documents.filter((doc) => !doc.file);
    if (missingDocs.length > 0) {
      toast.error("Please upload all required documents");
      return;
    }

    const docsWithFiles = documents.filter((doc) => doc.file);
    setIsLoading(true);
    try {


      const formData = new FormData();
      formData.append("SellerId", sellerId);

      docsWithFiles.forEach((doc, index) => {
        if (doc.file) {
          // Using indexed pattern for list of complex objects
          formData.append(`Documents[${index}].DocumentType`, doc.type.toString());
          // Try 'Document' property as per Driver API usage
          formData.append(`Documents[${index}].Document`, doc.file);
        }
      });
      
      console.log('Sending bulk upload...');
      await createSellerDocuments(formData, session?.accessToken || "");

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
            Seller Created Successfully!
          </Title>
          <Text className="mb-6 text-gray-500">
            The seller account has been created and documents uploaded. The documents are pending review.
          </Text>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push(routes.sellers.list)}>
              View All Sellers
            </Button>
            <Button
              className="bg-[#1f502a] hover:bg-[#143219]"
              onClick={() => {
                setStep("info");
                setSellerId(null);
                setDocuments(
                  requiredDocuments.map((doc) => ({
                    type: doc.type,
                    file: null,
                  }))
                );
              }}
            >
              Create Another Seller
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
        <PageHeader title="Upload Seller Documents" breadcrumb={pageHeader.breadcrumb} isStaticTitle />
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1f502a] text-white">
                <PiCheckCircleBold className="h-5 w-5" />
              </div>
              <Text className="font-medium">Step 1: Seller Information</Text>
              <div className="ml-4 h-1 flex-1 bg-[#1f502a]"></div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1f502a] text-white">2</div>
              <Text className="font-medium">Documents</Text>
            </div>
            <Title as="h3" className="mb-2 text-xl font-semibold">
              Upload Business Documents
            </Title>
            <Text className="text-gray-500">
              Upload the required business documents for verification.
            </Text>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {requiredDocuments.map((docInfo) => {
              const doc = documents.find((d) => d.type === docInfo.type);
              return (
                <div key={docInfo.type} className="rounded-lg border border-gray-200 p-4 dark:border-gray-600 flex flex-col h-full">
                  <Text className="mb-3 font-medium text-center">{docInfo.label} *</Text>
                  <div className="flex-1 flex flex-col">
                    {doc?.file ? (
                      <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-600 h-full justify-center">
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-50">
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
                        <div className="w-full text-center">
                          <Text className="truncate text-sm font-medium w-full text-center px-2">{doc.file.name}</Text>
                          <Text className="text-xs text-gray-500">
                            {(doc.file.size / 1024).toFixed(1)} KB
                          </Text>
                        </div>
                        <DeletePopover
                          title="Remove Document"
                          description="Are you sure you want to remove this document?"
                          onDelete={() => handleRemoveFile(docInfo.type)}
                          translateTitle={false}
                        >
                          <ActionIcon
                            size="sm"
                            variant="flat"
                            color="danger"
                            className="mt-1"
                          >
                            <PiTrashBold className="h-4 w-4" />
                          </ActionIcon>
                        </DeletePopover>
                      </div>
                    ) : (
                      <Upload
                        accept="imgAndPdf"
                        onChange={(e) => handleFileChange(docInfo.type, e)}
                        className="min-h-[160px] h-full"
                        iconClassName="w-12 h-12"
                        placeholderText={
                          <div className="text-center">
                            <Text className="text-sm font-medium">Select file</Text>
                            <Text className="text-xs text-gray-500">Image or PDF</Text>
                          </div>
                        }
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
            <Button
              type="button"
              className="w-full bg-[#1f502a] hover:bg-[#143219]"
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
            <Text className="font-medium">Step 1: Seller Information</Text>
            <div className="ml-4 h-1 flex-1 bg-gray-200"></div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500">2</div>
            <Text className="text-gray-500">Documents</Text>
          </div>
          <Title as="h3" className="mb-2 text-xl font-semibold">
            Seller Information
          </Title>
          <Text className="text-gray-500">
            Enter the seller&apos;s business information. After this, you&apos;ll upload their documents.
          </Text>
        </div>

        <Form<RegisterSellerSchema>
          validationSchema={registerSellerSchema(t)}
          onSubmit={onSubmit}
          useFormProps={{
            mode: "onChange",
            defaultValues: initialValues,
          }}
        >
          {({ register, formState: { errors }, setValue }) => (
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
                <Input
                  label="Bank Name"
                  placeholder="Enter bank name"
                  {...register("bankName")}
                  error={errors.bankName?.message}
                  disabled={isLoading}
                />
                <Input
                  label="Bank Account Number"
                  placeholder="Enter bank account number"
                  {...register("bankAccountNumber")}
                  error={errors.bankAccountNumber?.message}
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
              </div>

              <div className="flex gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(routes.sellers.list)}
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
