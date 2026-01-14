"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Button, Loader } from "rizzui";
import { PiPencilBold, PiArrowLeftBold, PiCheckCircleBold, PiCurrencyDollarBold, PiProhibitBold, PiEyeBold } from "react-icons/pi";
import { Link, useRouter } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { getSupportById, isAdmin } from "@/services/support.service";
import {
  SupportAgent,
  getDepartmentLabel,
  getStatusLabel,
  SupportStatus,
} from "@/types/support.types";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";

function getStatusDotColor(status: SupportStatus) {
  switch (status) {
    case SupportStatus.ONLINE:
      return "bg-green-500";
    case SupportStatus.BUSY:
      return "bg-yellow-500";
    case SupportStatus.AWAY:
      return "bg-[#1f502a]";
    case SupportStatus.OFFLINE:
    default:
      return "bg-gray-400";
  }
}

function getStatusBadgeColor(status: SupportStatus) {
  switch (status) {
    case SupportStatus.ONLINE:
      return "success";
    case SupportStatus.BUSY:
      return "warning";
    case SupportStatus.AWAY:
      return "info";
    case SupportStatus.OFFLINE:
    default:
      return "secondary";
  }
}

export default function SupportAgentDetailsPage({
  agentId,
}: {
  agentId: string;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [agent, setAgent] = useState<SupportAgent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const pageHeader = {
    title: "Support Agent Details",
    breadcrumb: [
      { name: "Home", href: "/" },
      { name: "Admin", href: "#" },
      { name: "Support Agents", href: routes.support.agents },
      { name: "Details" },
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
      router.push(routes.auth.signIn);
    }
  }, [status, fetchAgent, router]);

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
        <Link href={routes.support.agents}>
          <Button variant="outline">
            <PiArrowLeftBold className="me-1.5 h-4 w-4" />
            Back to Agents
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link href={routes.support.editAgent(agent.id)}>
          <Button className="mt-4 w-full sm:mt-0 sm:w-auto">
            <PiPencilBold className="me-1.5 h-4 w-4" />
            Edit Agent
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Basic Information Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <Title as="h4" className="text-lg font-semibold">
              Basic Information
            </Title>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${getStatusDotColor(agent.status)}`} />
              <Text className="font-medium">{getStatusLabel(agent.status)}</Text>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Text className="text-sm text-gray-500">Full Name</Text>
              <Text className="font-medium">
                {agent.firstName} {agent.lastName}
              </Text>
            </div>
            <div>
              <Text className="text-sm text-gray-500">Email</Text>
              <Text className="font-medium">{agent.email}</Text>
            </div>
            <div>
              <Text className="text-sm text-gray-500">Phone Number</Text>
              <Text className="font-medium">{agent.phoneNumber}</Text>
            </div>
            <div>
              <Text className="text-sm text-gray-500">Department</Text>
              <Text className="font-medium">
                {getDepartmentLabel(agent.department)}
              </Text>
            </div>
            <div>
              <Text className="text-sm text-gray-500">Created At</Text>
              <Text className="font-medium">
                {new Date(agent.createdAt).toLocaleDateString()}
              </Text>
            </div>
            <div>
              <Text className="text-sm text-gray-500">Last Login</Text>
              <Text className="font-medium">
                {agent.lastLoginAt
                  ? new Date(agent.lastLoginAt).toLocaleString()
                  : "Never"}
              </Text>
            </div>
          </div>
        </div>

        {/* Performance Stats Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <Title as="h4" className="mb-4 text-lg font-semibold">
            Performance Statistics
          </Title>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <Text className="text-sm text-gray-500">Total Tickets Handled</Text>
              <Text className="text-2xl font-bold text-primary">
                {agent.totalTicketsHandled}
              </Text>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <Text className="text-sm text-gray-500">Tickets Resolved</Text>
              <Text className="text-2xl font-bold text-green-600">
                {agent.totalTicketsResolved}
              </Text>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <Text className="text-sm text-gray-500">Active Tickets</Text>
              <Text className="text-2xl font-bold text-orange-500">
                {agent.currentActiveTickets}
              </Text>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <Text className="text-sm text-gray-500">Satisfaction Score</Text>
              <Text className="text-2xl font-bold text-[#1f502a]">
                {agent.customerSatisfactionScore.toFixed(1)}
              </Text>
            </div>
            <div className="col-span-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <Text className="text-sm text-gray-500">
                Avg. Resolution Time (Hours)
              </Text>
              <Text className="text-2xl font-bold">
                {agent.averageResolutionTimeHours.toFixed(1)}
              </Text>
            </div>
          </div>
        </div>

        {/* Permissions Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
          <Title as="h4" className="mb-4 text-lg font-semibold">
            Permissions
          </Title>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div
              className={`flex items-center gap-3 rounded-lg border p-4 ${
                agent.canCloseTickets
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                  : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  agent.canCloseTickets
                    ? "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300"
                    : "bg-gray-200 text-gray-400 dark:bg-gray-700"
                }`}
              >
                <PiCheckCircleBold className="h-5 w-5" />
              </div>
              <div>
                <Text className="font-medium">Close Tickets</Text>
                <Text className={`text-xs ${agent.canCloseTickets ? "text-green-600 dark:text-green-400" : "text-gray-500"}`}>
                  {agent.canCloseTickets ? "Enabled" : "Disabled"}
                </Text>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 rounded-lg border p-4 ${
                agent.canIssueRefunds
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                  : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  agent.canIssueRefunds
                    ? "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300"
                    : "bg-gray-200 text-gray-400 dark:bg-gray-700"
                }`}
              >
                <PiCurrencyDollarBold className="h-5 w-5" />
              </div>
              <div>
                <Text className="font-medium">Issue Refunds</Text>
                <Text className={`text-xs ${agent.canIssueRefunds ? "text-green-600 dark:text-green-400" : "text-gray-500"}`}>
                  {agent.canIssueRefunds ? "Enabled" : "Disabled"}
                </Text>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 rounded-lg border p-4 ${
                agent.canBanUsers
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                  : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  agent.canBanUsers
                    ? "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300"
                    : "bg-gray-200 text-gray-400 dark:bg-gray-700"
                }`}
              >
                <PiProhibitBold className="h-5 w-5" />
              </div>
              <div>
                <Text className="font-medium">Ban Users</Text>
                <Text className={`text-xs ${agent.canBanUsers ? "text-green-600 dark:text-green-400" : "text-gray-500"}`}>
                  {agent.canBanUsers ? "Enabled" : "Disabled"}
                </Text>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 rounded-lg border p-4 ${
                agent.canViewAllTickets
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                  : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  agent.canViewAllTickets
                    ? "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300"
                    : "bg-gray-200 text-gray-400 dark:bg-gray-700"
                }`}
              >
                <PiEyeBold className="h-5 w-5" />
              </div>
              <div>
                <Text className="font-medium">View All Tickets</Text>
                <Text className={`text-xs ${agent.canViewAllTickets ? "text-green-600 dark:text-green-400" : "text-gray-500"}`}>
                  {agent.canViewAllTickets ? "Enabled" : "Disabled"}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
