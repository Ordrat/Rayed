"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Badge, Button, Loader, Popover } from "rizzui";
import {
  PiArrowLeftBold,
  PiMapPinBold,
  PiPhoneBold,
  PiStorefrontBold,
  PiHashBold,
  PiMapTrifoldBold,
  PiCheckCircleBold,
  PiXCircleBold,
} from "react-icons/pi";
import { Link, useRouter } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { getBranchById, changeBranchStatus } from "@/services/branch.service";
import { Branch, BranchStatus, getBranchName, getBranchStatusLabel } from "@/types/branch.types";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";
import { useTranslations, useLocale } from "next-intl";

function getStatusBadgeColor(status: BranchStatus) {
  switch (status) {
    case BranchStatus.APPROVED:
      return "success";
    case BranchStatus.PENDING:
      return "warning";
    case BranchStatus.REJECTED:
      return "danger";
    default:
      return "secondary";
  }
}

interface BranchDetailsPageProps {
  branchId: string;
}

export default function BranchDetailsPage({ branchId }: BranchDetailsPageProps) {
  const t = useTranslations("layout");
  const locale = useLocale();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const pageHeader = {
    title: t("branch-details"),
    breadcrumb: [
      { name: t("sidebar-menu-overview"), href: "/", isStatic: true },
      { name: t("sidebar-menu-admin"), href: "#", isStatic: true },
      { name: t("sidebar-menu-branches"), href: routes.branches.list, isStatic: true },
      { name: t("branch-details"), isStatic: true },
    ],
  };

  const fetchBranch = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getBranchById(branchId, session?.accessToken || "");
      setBranch(data);
    } catch (error: any) {
      toast.error(error.message || t("error-fetch-branch"));
    } finally {
      setIsLoading(false);
    }
  }, [branchId, session?.accessToken, t]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchBranch();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [status, fetchBranch, router]);

  const handleApprove = async () => {
    if (!branch) return;
    setIsProcessing(true);
    try {
      await changeBranchStatus({ id: branch.id, status: BranchStatus.APPROVED }, session?.accessToken || "");
      setBranch({ ...branch, status: BranchStatus.APPROVED });
      toast.success(t("branch-approved"));
    } catch (error: any) {
      toast.error(error.message || t("error-approve-branch"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!branch) return;
    setIsProcessing(true);
    try {
      await changeBranchStatus({ id: branch.id, status: BranchStatus.REJECTED }, session?.accessToken || "");
      setBranch({ ...branch, status: BranchStatus.REJECTED });
      toast.success(t("branch-rejected"));
    } catch (error: any) {
      toast.error(error.message || t("error-reject-branch"));
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center">
        <Text className="mb-4 text-gray-500">{t("branch-not-found")}</Text>
        <Link href={routes.branches.list}>
          <Button variant="outline">
            <PiArrowLeftBold className="me-1.5 h-4 w-4" />
            {t("back-to-branches")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} isStaticTitle={true}>
        <Link href={routes.branches.list}>
          <Button variant="outline" className="mt-4 sm:mt-0">
            <PiArrowLeftBold className="me-1.5 h-4 w-4 rtl:rotate-180" />
            {t("back-to-branches")}
          </Button>
        </Link>
      </PageHeader>

      <div className="w-full space-y-6">
        {/* General Overview Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700">
                <PiStorefrontBold className="h-10 w-10 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Title as="h3" className="text-xl font-bold">
                    {getBranchName(branch, locale)}
                  </Title>
                  <Badge variant="flat" color={getStatusBadgeColor(branch.status)} className="capitalize">
                    {getBranchStatusLabel(branch.status)}
                  </Badge>
                </div>
                <Text className="text-base text-gray-500">{locale === "ar" ? branch.nameEn : branch.nameAr}</Text>
              </div>
            </div>

            {/* Approve/Reject Actions for Pending Branches */}
            {branch.status === BranchStatus.PENDING && (
              <div className="flex w-full flex-shrink-0 gap-3 md:w-auto">
                <Popover placement="bottom-end">
                  <Popover.Trigger>
                    <Button
                      className="flex-1 bg-green-600 text-white hover:bg-green-700 active:bg-green-700 md:flex-none border-transparent"
                      disabled={isProcessing}
                      isLoading={isProcessing}
                    >
                      <PiCheckCircleBold className="me-1.5 h-4 w-4" />
                      {t("approve")}
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content className="z-[9999] shadow-xl">
                    {({ setOpen }) => (
                      <div className="w-56 p-3">
                        <Title as="h6" className="mb-2 text-base font-semibold">
                          {t("approve-branch-title")}
                        </Title>
                        <Text className="mb-4 text-sm text-gray-500">{t("approve-branch-confirm")}</Text>
                        <div className="flex items-center justify-end">
                          <Button
                            size="sm"
                            className="me-1.5 h-7 bg-green-600 text-white hover:bg-green-700 active:bg-green-700"
                            onClick={() => {
                              handleApprove();
                              setOpen(false);
                            }}
                          >
                            {t("yes")}
                          </Button>
                          <Button size="sm" variant="outline" className="h-7" onClick={() => setOpen(false)}>
                            {t("no")}
                          </Button>
                        </div>
                      </div>
                    )}
                  </Popover.Content>
                </Popover>

                <Popover placement="bottom-end">
                  <Popover.Trigger>
                    <Button
                      className="flex-1 bg-red-600 text-white hover:bg-red-700 active:bg-red-700 md:flex-none border-transparent"
                      disabled={isProcessing}
                      isLoading={isProcessing}
                    >
                      <PiXCircleBold className="me-1.5 h-4 w-4" />
                      {t("reject")}
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content className="z-[9999] shadow-xl">
                    {({ setOpen }) => (
                      <div className="w-56 p-3">
                        <Title as="h6" className="mb-2 text-base font-semibold">
                          {t("reject-branch-title")}
                        </Title>
                        <Text className="mb-4 text-sm text-gray-500">{t("reject-branch-confirm")}</Text>
                        <div className="flex items-center justify-end">
                          <Button
                            size="sm"
                            className="me-1.5 h-7 bg-red-600 text-white hover:bg-red-700 active:bg-red-700"
                            onClick={() => {
                              handleReject();
                              setOpen(false);
                            }}
                          >
                            {t("yes")}
                          </Button>
                          <Button size="sm" variant="outline" className="h-7" onClick={() => setOpen(false)}>
                            {t("no")}
                          </Button>
                        </div>
                      </div>
                    )}
                  </Popover.Content>
                </Popover>
              </div>
            )}
          </div>

          <div className="my-8 border-t border-dashed border-gray-200 dark:border-gray-700" />

          <div>
            <Title as="h4" className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
              {t("contact-info")}
            </Title>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="group rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-700">
                    <PiPhoneBold className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <Text className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("phone-number")}
                    </Text>
                    <Text className="text-base font-semibold text-gray-900 dark:text-white">{branch.phoneNumber}</Text>
                  </div>
                </div>
              </div>

              <div className="group rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-700">
                    <PiHashBold className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <Text className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                      {t("display-order")}
                    </Text>
                    <Text className="text-base font-semibold text-gray-900 dark:text-white">{branch.displayOrder}</Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <Title as="h4" className="mb-4 font-semibold">
            {t("location-info")}
          </Title>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <PiMapPinBold className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
              <div>
                <Text className="text-sm text-gray-500">{t("full-address")}</Text>
                <Text className="font-medium">
                  {branch.fullAddress || `${branch.street}, ${branch.district}, ${branch.city}`}
                </Text>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <Text className="text-sm text-gray-500">{t("city")}</Text>
                <Text className="font-medium">{branch.city}</Text>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <Text className="text-sm text-gray-500">{t("district")}</Text>
                <Text className="font-medium">{branch.district}</Text>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <Text className="text-sm text-gray-500">{t("street")}</Text>
                <Text className="font-medium">{branch.street}</Text>
              </div>
              {branch.buildingNumber && (
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <Text className="text-sm text-gray-500">{t("building-number")}</Text>
                  <Text className="font-medium">{branch.buildingNumber}</Text>
                </div>
              )}
              {branch.governorate && (
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <Text className="text-sm text-gray-500">{t("governorate")}</Text>
                  <Text className="font-medium">{branch.governorate}</Text>
                </div>
              )}
            </div>

            {(branch.latitude || branch.longitude) && (
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <PiMapTrifoldBold className="h-5 w-5 text-gray-400" />
                <div>
                  <Text className="text-sm text-gray-500">{t("coordinates")}</Text>
                  <Text className="font-medium">
                    {branch.latitude}, {branch.longitude}
                  </Text>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
