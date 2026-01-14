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
  Switch,
  Loader,
  ActionIcon,
  Tooltip,
} from "rizzui";
import { PiShuffleBold } from "react-icons/pi";
import { Form } from "@core/ui/form";
import { routes } from "@/config/routes";
import { registerSupport, isAdmin } from "@/services/support.service";
import { SupportDepartment } from "@/types/support.types";
import {
  registerSupportSchema,
  RegisterSupportSchema,
} from "@/validators/support.schema";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const pageHeader = {
  title: "Create Support Agent",
  breadcrumb: [
    { name: "Home", href: "/" },
    { name: "Admin", href: "#" },
    { name: "Support Agents", href: routes.support.agents },
    { name: "Create" },
  ],
};

const departmentOptions = [
  { value: SupportDepartment.GENERAL, label: "General" },
  { value: SupportDepartment.TECHNICAL, label: "Technical" },
  { value: SupportDepartment.BILLING, label: "Billing" },
  { value: SupportDepartment.SALES, label: "Sales" },
];

const initialValues: RegisterSupportSchema = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  department: SupportDepartment.GENERAL,
  canCloseTickets: true,
  canIssueRefunds: false,
  canBanUsers: false,
  canViewAllTickets: false,
};

export default function CreateSupportAgentPage() {
  const t = useTranslations("form");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      // TODO: Re-enable permission check when backend permissions are implemented
      // if (!isAdmin(session?.user?.roles || [])) {
      //   toast.error("You don't have permission to access this page");
      //   router.push("/");
      // }
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [session, status, router]);

  const onSubmit: SubmitHandler<RegisterSupportSchema> = async (data) => {
    setIsLoading(true);
    try {
      await registerSupport(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          password: data.password,
          department: data.department,
          canCloseTickets: data.canCloseTickets,
          canIssueRefunds: data.canIssueRefunds,
          canBanUsers: data.canBanUsers,
          canViewAllTickets: data.canViewAllTickets,
        },
        session?.accessToken || ""
      );
      toast.success("Support agent created successfully!");
      router.push(routes.support.agents);
    } catch (error: any) {
      console.error("RegisterSupport error:", error);
      console.error("Error details:", error.details);
      const errorMessage = error.details?.detail || error.details?.title || error.message || "Failed to create support agent";
      toast.error(errorMessage);
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

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6">
          <Title as="h3" className="mb-2 text-xl font-semibold">
            Agent Information
          </Title>
          <Text className="text-gray-500">
            Create a new support agent account. The agent will be required to
            change their password on first login for security.
          </Text>
        </div>

        <Form<RegisterSupportSchema>
          validationSchema={registerSupportSchema(t)}
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
                          
                          // Ensure at least one uppercase letter
                          password += uppercase.charAt(
                            Math.floor(Math.random() * uppercase.length)
                          );
                          
                          // Ensure at least one number
                          password += numbers.charAt(
                            Math.floor(Math.random() * numbers.length)
                          );
                          
                          // Fill the rest with random characters (10 more to make 12 total)
                          for (let i = 0; i < 10; i++) {
                            password += allChars.charAt(
                              Math.floor(Math.random() * allChars.length)
                            );
                          }
                          
                          // Shuffle the password to randomize positions
                          password = password
                            .split("")
                            .sort(() => 0.5 - Math.random())
                            .join("");

                          setValue("password", password, {
                            shouldValidate: true,
                          });
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
                  label="Department"
                  options={departmentOptions}
                  value={departmentOptions.find(
                    (opt) => opt.value === watch("department")
                  )}
                  onChange={(option: any) =>
                    setValue("department", option?.value ?? SupportDepartment.GENERAL)
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                <Title as="h4" className="mb-4 text-lg font-semibold">
                  Permissions
                </Title>
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-md border border-gray-100 p-4 dark:border-gray-700/50">
                    <div>
                      <Text className="font-medium">Can Close Tickets</Text>
                      <Text className="text-sm text-gray-500">
                        Allow this agent to close support tickets
                      </Text>
                    </div>
                    <Switch
                      {...register("canCloseTickets")}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-gray-100 p-4 dark:border-gray-700/50">
                    <div>
                      <Text className="font-medium">Can Issue Refunds</Text>
                      <Text className="text-sm text-gray-500">
                        Allow this agent to process refunds
                      </Text>
                    </div>
                    <Switch
                      {...register("canIssueRefunds")}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-gray-100 p-4 dark:border-gray-700/50">
                    <div>
                      <Text className="font-medium">Can Ban Users</Text>
                      <Text className="text-sm text-gray-500">
                        Allow this agent to ban users
                      </Text>
                    </div>
                    <Switch {...register("canBanUsers")} disabled={isLoading} />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-gray-100 p-4 dark:border-gray-700/50">
                    <div>
                      <Text className="font-medium">Can View All Tickets</Text>
                      <Text className="text-sm text-gray-500">
                        Allow this agent to view all tickets
                      </Text>
                    </div>
                    <Switch
                      {...register("canViewAllTickets")}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(routes.support.agents)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={isLoading}
                >
                  Create Agent
                </Button>
              </div>
            </div>
          )}
        </Form>
      </div>
    </>
  );
}
