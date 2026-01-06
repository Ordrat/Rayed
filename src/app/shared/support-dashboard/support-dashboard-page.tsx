"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Loader } from "rizzui";
import { PiHeadsetDuotone, PiClockDuotone } from "react-icons/pi";
import { routes } from "@/config/routes";
import { isSupportAgent } from "@/services/support.service";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/routing";

const pageHeader = {
  title: "Support Dashboard",
  breadcrumb: [
    { name: "Home", href: "/" },
    { name: "Support Dashboard" },
  ],
};

export default function SupportDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      // Check if user needs to reset password
      if (session?.user?.needsPasswordReset) {
        router.push(routes.forms.profileSettings + "/password");
        return;
      }
      
      // Check if user has support role
      if (!isSupportAgent(session?.user?.roles || [])) {
        toast.error("You don't have permission to access the support dashboard");
        router.push("/");
      }
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn1);
    }
  }, [session, status, router]);

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

      {/* Welcome Section */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-gradient-to-r from-primary/10 to-primary/5 p-8 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <PiHeadsetDuotone className="h-8 w-8 text-primary" />
          </div>
          <div>
            <Title as="h2" className="mb-1 text-2xl font-bold">
              Welcome, {session?.user?.firstName || "Support Agent"}!
            </Title>
            <Text className="text-gray-600 dark:text-gray-400">
              Your support dashboard is ready. More features coming soon.
            </Text>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-gray-800/50">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
          <PiClockDuotone className="h-10 w-10 text-gray-500 dark:text-gray-400" />
        </div>
        <Title as="h3" className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-300">
          Dashboard Coming Soon
        </Title>
        <Text className="max-w-md text-gray-500 dark:text-gray-400">
          Your support dashboard features are being developed. Check back soon for ticket management, 
          customer interactions, and more tools to help you provide excellent support.
        </Text>
      </div>

      {/* Quick Stats Placeholder */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Open Tickets", value: "-", color: "bg-[#1f502a]" },
          { label: "Resolved Today", value: "-", color: "bg-green-500" },
          { label: "Pending Response", value: "-", color: "bg-yellow-500" },
          { label: "Avg. Response Time", value: "-", color: "bg-purple-500" },
        ].map((stat, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-2 flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${stat.color}`} />
              <Text className="text-sm text-gray-500">{stat.label}</Text>
            </div>
            <Text className="text-3xl font-bold text-gray-400">{stat.value}</Text>
          </div>
        ))}
      </div>
    </>
  );
}
