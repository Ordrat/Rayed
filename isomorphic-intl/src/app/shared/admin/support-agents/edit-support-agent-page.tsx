"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { SubmitHandler } from "react-hook-form";
import { Title, Text, Button, Input, Select, Switch, Loader } from "rizzui";
import { Form } from "@core/ui/form";
import { routes } from "@/config/routes";
import { getSupportById, updateSupport, isAdmin } from "@/services/support.service";
import { SupportAgent, SupportDepartment } from "@/types/support.types";
import { updateSupportSchema, UpdateSupportSchema } from "@/validators/support.schema";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const departmentOptions = [
  { value: SupportDepartment.GENERAL, label: "General" },
  { value: SupportDepartment.TECHNICAL, label: "Technical" },
  { value: SupportDepartment.BILLING, label: "Billing" },
  { value: SupportDepartment.SALES, label: "Sales" },
];

export default function EditSupportAgentPage({ agentId }: { agentId: string }) {
  const t = useTranslations("form");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [agent, setAgent] = useState<SupportAgent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageHeader = {
    title: "Edit Support Agent",
    breadcrumb: [
      { name: "Home", href: "/" },
      { name: "Admin", href: "#" },
      { name: "Support Agents", href: routes.support.agents },
      { name: "Edit" },
    ],
  };

  const fetchAgent = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getSupportById(agentId, session?.accessToken || "");
      setAgent(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch agent details");
      router.push(routes.support.agents);
    } finally {
      setIsLoading(false);
    }
  }, [agentId, session?.accessToken, router]);

  useEffect(() => {
    if (status === "authenticated") {
      // TODO: Re-enable permission check when backend permissions are implemented
      // if (!isAdmin(session?.user?.roles || [])) {
      //   toast.error("You don't have permission to access this page");
      //   router.push("/");
      //   return;
      // }
      fetchAgent();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn1);
    }
  }, [status, router, fetchAgent]);

  const onSubmit: SubmitHandler<UpdateSupportSchema> = async (data) => {
    setIsSubmitting(true);
    try {
      await updateSupport(
        {
          supportId: agentId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          department: data.department,
          canCloseTickets: data.canCloseTickets,
          canIssueRefunds: data.canIssueRefunds,
          canBanUsers: data.canBanUsers,
          canViewAllTickets: data.canViewAllTickets,
        },
        session?.accessToken || ""
      );
      toast.success("Support agent updated successfully!");
      router.push(routes.support.agentDetails(agentId));
    } catch (error: any) {
      toast.error(error.message || "Failed to update support agent");
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center">
        <Text className="mb-4 text-lg text-gray-500">Agent not found</Text>
        <Button variant="outline" onClick={() => router.push(routes.support.agents)}>
          Back to Agents
        </Button>
      </div>
    );
  }

  const initialValues: UpdateSupportSchema = {
    supportId: agent.id,
    firstName: agent.firstName,
    lastName: agent.lastName,
    email: agent.email,
    phoneNumber: agent.phoneNumber,
    department: agent.department,
    canCloseTickets: agent.canCloseTickets,
    canIssueRefunds: agent.canIssueRefunds,
    canBanUsers: agent.canBanUsers,
    canViewAllTickets: agent.canViewAllTickets,
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6">
          <Title as="h3" className="mb-2 text-xl font-semibold">
            Edit Agent Information
          </Title>
          <Text className="text-gray-500">Update the support agent&apos;s information and permissions.</Text>
        </div>

        <Form<UpdateSupportSchema>
          validationSchema={updateSupportSchema(t)}
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
                  disabled={isSubmitting}
                />
                <Input
                  label="Last Name"
                  placeholder="Enter last name"
                  {...register("lastName")}
                  error={errors.lastName?.message}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  type="email"
                  label="Email"
                  placeholder="Enter email address"
                  {...register("email")}
                  error={errors.email?.message}
                  disabled={isSubmitting}
                />

                <Input
                  label="Phone Number"
                  placeholder="Enter phone number"
                  {...register("phoneNumber")}
                  error={errors.phoneNumber?.message}
                  disabled={isSubmitting}
                />
              </div>

              <Select
                label="Department"
                options={departmentOptions}
                value={departmentOptions.find((opt) => opt.value === watch("department"))}
                onChange={(option: any) => setValue("department", option?.value ?? SupportDepartment.GENERAL)}
                disabled={isSubmitting}
              />

              <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                <Title as="h4" className="mb-4 text-lg font-semibold">
                  Permissions
                </Title>
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-md border border-gray-100 p-4 dark:border-gray-700/50">
                    <div>
                      <Text className="font-medium">Can Close Tickets</Text>
                      <Text className="text-sm text-gray-500">Allow this agent to close support tickets</Text>
                    </div>
                    <Switch
                      checked={watch("canCloseTickets")}
                      onChange={(e) => setValue("canCloseTickets", e.target.checked)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-gray-100 p-4 dark:border-gray-700/50">
                    <div>
                      <Text className="font-medium">Can Issue Refunds</Text>
                      <Text className="text-sm text-gray-500">Allow this agent to process refunds</Text>
                    </div>
                    <Switch
                      checked={watch("canIssueRefunds")}
                      onChange={(e) => setValue("canIssueRefunds", e.target.checked)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-gray-100 p-4 dark:border-gray-700/50">
                    <div>
                      <Text className="font-medium">Can Ban Users</Text>
                      <Text className="text-sm text-gray-500">Allow this agent to ban users</Text>
                    </div>
                    <Switch
                      checked={watch("canBanUsers")}
                      onChange={(e) => setValue("canBanUsers", e.target.checked)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-gray-100 p-4 dark:border-gray-700/50">
                    <div>
                      <Text className="font-medium">Can View All Tickets</Text>
                      <Text className="text-sm text-gray-500">Allow this agent to view all tickets</Text>
                    </div>
                    <Switch
                      checked={watch("canViewAllTickets")}
                      onChange={(e) => setValue("canViewAllTickets", e.target.checked)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(routes.support.agentDetails(agentId))}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" isLoading={isSubmitting}>
                  Update Agent
                </Button>
              </div>
            </div>
          )}
        </Form>
      </div>
    </>
  );
}
