"use client";

import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button, Input, Password, Text, Loader, Title } from "rizzui";
import { useRouter } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { registerSeller, createSellerDocuments } from "@/services/seller.service";
import { SellerDocumentType } from "@/types/seller.types";
import toast from "react-hot-toast";

interface SellerSignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  bankAccountNumber: string;
  bankName: string;
}

export default function SellerSignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"form" | "documents" | "success">("form");
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SellerSignUpFormData>();

  const password = watch("password");

  const onSubmit: SubmitHandler<SellerSignUpFormData> = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const seller = await registerSeller({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        bankAccountNumber: data.bankAccountNumber,
        bankName: data.bankName,
      });
      setSellerId(seller.id);
      setStep("documents");
      toast.success("Account created! Now upload your documents.");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  const handleDocumentSubmit = async () => {
    if (!sellerId) return;

    if (documents.length === 0) {
      toast.error("Please upload at least one document");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("SellerId", sellerId);
      documents.forEach((file) => {
        formData.append("Documents", file);
      });

      await createSellerDocuments(formData);
      setStep("success");
      toast.success("Documents uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload documents");
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
          Registration Complete!
        </Title>
        <Text className="mb-6 text-gray-600">
          Your application has been submitted successfully. Our team will review
          your documents and approve your account within 24-48 hours.
        </Text>
        <Button onClick={() => router.push(routes.auth.signIn)}>
          Go to Sign In
        </Button>
      </div>
    );
  }

  if (step === "documents") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Title as="h3" className="mb-2 text-xl font-bold">
            Upload Your Documents
          </Title>
          <Text className="text-gray-500">
            Please upload the required documents for verification (National ID,
            Commercial Register, Tax Certificate, etc.)
          </Text>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Business Documents *
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileChange}
              className="w-full rounded-lg border border-gray-300 p-2"
            />
            <Text className="mt-1 text-xs text-gray-500">
              You can select multiple files. Accepted: Images, PDF
            </Text>
          </div>

          {documents.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-4">
              <Text className="mb-2 font-medium">Selected files:</Text>
              <ul className="space-y-1">
                {documents.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Button
          type="button"
          className="w-full rounded-full bg-[#1f502a] hover:bg-[#143219]"
          onClick={handleDocumentSubmit}
          disabled={isLoading}
        >
          {isLoading ? <Loader variant="spinner" /> : "Submit Documents"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="text"
          label="First Name"
          placeholder="Enter your first name"
          {...register("firstName", { required: "First name is required" })}
          error={errors.firstName?.message}
        />
        <Input
          type="text"
          label="Last Name"
          placeholder="Enter your last name"
          {...register("lastName", { required: "Last name is required" })}
          error={errors.lastName?.message}
        />
      </div>

      <Input
        type="email"
        label="Email"
        placeholder="Enter your email"
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address",
          },
        })}
        error={errors.email?.message}
      />

      <Input
        type="tel"
        label="Phone Number"
        placeholder="Enter your phone number"
        {...register("phoneNumber", { required: "Phone number is required" })}
        error={errors.phoneNumber?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="text"
          label="Bank Name"
          placeholder="Enter bank name"
          {...register("bankName", { required: "Bank name is required" })}
          error={errors.bankName?.message}
        />
        <Input
          type="text"
          label="Bank Account Number"
          placeholder="Enter account number"
          {...register("bankAccountNumber", {
            required: "Account number is required",
          })}
          error={errors.bankAccountNumber?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Password
          label="Password"
          placeholder="Enter your password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          })}
          error={errors.password?.message}
        />

        <Password
          label="Confirm Password"
          placeholder="Confirm your password"
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
          error={errors.confirmPassword?.message}
        />
      </div>

      <Button
        type="submit"
        className="w-full rounded-full bg-[#1f502a] hover:bg-[#143219]"
        disabled={isLoading}
      >
        {isLoading ? <Loader variant="spinner" /> : "Create Account"}
      </Button>
    </form>
  );
}
