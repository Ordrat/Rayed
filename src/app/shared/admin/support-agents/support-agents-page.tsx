"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Badge, Button, Loader } from "rizzui";
import { PiPlusBold, PiEyeBold, PiPencilBold } from "react-icons/pi";
import { Link } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { getAllSupport, isAdmin } from "@/services/support.service";
import {
  SupportAgent,
  getDepartmentLabel,
  getStatusLabel,
  SupportStatus,
} from "@/types/support.types";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/routing";

const pageHeader = {
  title: "Support Agents",
  breadcrumb: [
    { name: "Home", href: "/" },
    { name: "Admin", href: "#" },
    { name: "Support Agents" },
  ],
};

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

export default function SupportAgentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      // Check if user has admin role
      if (!isAdmin(session?.user?.roles || [])) {
        toast.error("You don't have permission to access this page");
        router.push("/");
        return;
      }
      fetchAgents();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn1);
    }
  }, [session, status, router]);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const data = await getAllSupport(session?.accessToken || "");
      setAgents(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch support agents");
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

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link href={routes.support.createAgent}>
          <Button className="mt-4 w-full sm:mt-0 sm:w-auto">
            <PiPlusBold className="me-1.5 h-4 w-4" />
            Add Support Agent
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Text className="mb-4 text-gray-500">
              No support agents found. Create one to get started.
            </Text>
            <Link href={routes.support.createAgent}>
              <Button>
                <PiPlusBold className="me-1.5 h-4 w-4" />
                Create First Agent
              </Button>
            </Link>
          </div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <Title as="h4" className="mb-1 text-lg font-semibold">
                    {agent.firstName} {agent.lastName}
                  </Title>
                  <Text className="text-sm text-gray-500">{agent.email}</Text>
                </div>
                <Badge
                  variant="flat"
                  color={getStatusBadgeColor(agent.status)}
                  className="capitalize"
                >
                  {getStatusLabel(agent.status)}
                </Badge>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">Department:</Text>
                  <Text className="font-medium">
                    {getDepartmentLabel(agent.department)}
                  </Text>
                </div>
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">Phone:</Text>
                  <Text className="font-medium">{agent.phoneNumber}</Text>
                </div>
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">Tickets Handled:</Text>
                  <Text className="font-medium">{agent.totalTicketsHandled}</Text>
                </div>
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">Tickets Resolved:</Text>
                  <Text className="font-medium">{agent.totalTicketsResolved}</Text>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={routes.support.agentDetails(agent.id)}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    <PiEyeBold className="me-1.5 h-4 w-4" />
                    View
                  </Button>
                </Link>
                <Link
                  href={routes.support.editAgent(agent.id)}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    <PiPencilBold className="me-1.5 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
