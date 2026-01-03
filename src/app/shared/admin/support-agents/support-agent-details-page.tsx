"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Badge, Button, Loader } from "rizzui";
import { PiPencilBold, PiArrowLeftBold } from "react-icons/pi";
import { Link } from "@/i18n/routing";
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
import { useRouter } from "@/i18n/routing";

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
    title: agent
      ? `${agent.firstName} ${agent.lastName}`
      : "Support Agent Details",
    breadcrumb: [
      { name: "Home", href: "/" },
      { name: "Admin", href: "#" },
      { name: "Support Agents", href: routes.support.agents },
      { name: agent ? `${agent.firstName} ${agent.lastName}` : "Details" },
    ],
  };

  useEffect(() => {
    if (status === "authenticated") {
      if (!isAdmin(session?.user?.roles || [])) {
        toast.error("You don't have permission to access this page");
        router.push("/");
        return;
      }
      fetchAgent();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn1);
    }
  }, [session, status, router, agentId]);

  const fetchAgent = async () => {
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
            <Badge
              variant="flat"
              color={getStatusBadgeColor(agent.status)}
              className="capitalize"
            >
              {getStatusLabel(agent.status)}
            </Badge>
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
              <Text className="text-2xl font-bold text-blue-600">
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  agent.canCloseTickets ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <Text>Close Tickets</Text>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  agent.canIssueRefunds ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <Text>Issue Refunds</Text>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  agent.canBanUsers ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <Text>Ban Users</Text>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  agent.canViewAllTickets ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <Text>View All Tickets</Text>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
