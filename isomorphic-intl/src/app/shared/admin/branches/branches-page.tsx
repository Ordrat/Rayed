"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Badge, Button, Loader, Popover, Input, Select } from "rizzui";
import {
  PiEyeBold,
  PiCheckCircleBold,
  PiXCircleBold,
  PiMagnifyingGlassBold,
  PiSortAscendingBold,
  PiMapPinBold,
  PiPhoneBold,
  PiStorefrontBold,
} from "react-icons/pi";
import { Link, useRouter } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { getBranchesByShop, changeBranchStatus } from "@/services/branch.service";
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

export default function BranchesPage() {
  const t = useTranslations("layout");
  const locale = useLocale();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<any>({ value: "newest", label: t("sort-newest") });

  const pageHeader = {
    title: t("sidebar-menu-branches"),
    breadcrumb: [
      { name: t("sidebar-menu-overview"), href: "/" },
      { name: t("sidebar-menu-admin"), href: "#" },
      { name: t("sidebar-menu-branches") },
    ],
  };

  const filteredBranches = useMemo(() => {
    let result = [...branches];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (b) =>
          b.nameEn.toLowerCase().includes(term) ||
          b.nameAr.toLowerCase().includes(term) ||
          b.city.toLowerCase().includes(term) ||
          b.district.toLowerCase().includes(term) ||
          b.phoneNumber.includes(term)
      );
    }

    if (sortConfig) {
      const sortValue = sortConfig.value || sortConfig;
      result.sort((a, b) => {
        if (sortValue === "newest") return (b.displayOrder || 0) - (a.displayOrder || 0);
        if (sortValue === "oldest") return (a.displayOrder || 0) - (b.displayOrder || 0);
        if (sortValue === "name_asc") return a.nameEn.localeCompare(b.nameEn);
        if (sortValue === "name_desc") return b.nameEn.localeCompare(a.nameEn);
        return 0;
      });
    }
    return result;
  }, [branches, searchTerm, sortConfig]);

  const fetchBranches = useCallback(async () => {
    try {
      setIsLoading(true);
      const shopId = session?.user?.shopId;
      if (!shopId) {
        toast.error("Shop ID not found");
        return;
      }
      const data = await getBranchesByShop(shopId, session?.accessToken || "");
      setBranches(data);
    } catch (error: any) {
      toast.error(error.message || t("error-fetch-branches"));
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken, session?.user?.shopId, t]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchBranches();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [status, fetchBranches, router]);

  const handleApprove = async (branchId: string) => {
    setProcessingId(branchId);
    try {
      await changeBranchStatus(
        { id: branchId, status: BranchStatus.APPROVED },
        session?.accessToken || ""
      );
      setBranches(
        branches.map((b) =>
          b.id === branchId ? { ...b, status: BranchStatus.APPROVED } : b
        )
      );
      toast.success(t("branch-approved"));
    } catch (error: any) {
      toast.error(error.message || t("error-approve-branch"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (branchId: string) => {
    setProcessingId(branchId);
    try {
      await changeBranchStatus(
        { id: branchId, status: BranchStatus.REJECTED },
        session?.accessToken || ""
      );
      setBranches(
        branches.map((b) =>
          b.id === branchId ? { ...b, status: BranchStatus.REJECTED } : b
        )
      );
      toast.success(t("branch-rejected"));
    } catch (error: any) {
      toast.error(error.message || t("error-reject-branch"));
    } finally {
      setProcessingId(null);
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
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

      {branches.length > 0 && (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder={t("search-branches-placeholder")}
            prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3"
            clearable
            onClear={() => setSearchTerm("")}
          />
          <Select
            options={[
              { label: t("sort-newest"), value: "newest" },
              { label: t("sort-oldest"), value: "oldest" },
              { label: t("sort-name-az"), value: "name_asc" },
              { label: t("sort-name-za"), value: "name_desc" },
            ]}
            value={sortConfig}
            onChange={setSortConfig}
            className="w-full md:w-48"
            prefix={<PiSortAscendingBold className="h-4 w-4" />}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {branches.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <PiStorefrontBold className="mb-4 h-16 w-16 text-gray-300" />
            <Text className="text-gray-500">
              {t("no-branches-found")}
            </Text>
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            <Text className="mb-2">{t("no-results-for")} &quot;{searchTerm}&quot;</Text>
            <Button variant="text" onClick={() => setSearchTerm("")} className="text-[#1f502a]">
              {t("clear-search")}
            </Button>
          </div>
        ) : (
          filteredBranches.map((branch) => (
            <div
              key={branch.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <Title as="h4" className="mb-1 text-lg font-semibold">
                    {getBranchName(branch, locale)}
                  </Title>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <PiMapPinBold className="h-4 w-4" />
                    <Text>{branch.city}, {branch.district}</Text>
                  </div>
                </div>
                <Badge
                  variant="flat"
                  color={getStatusBadgeColor(branch.status)}
                  className="capitalize"
                >
                  {getBranchStatusLabel(branch.status)}
                </Badge>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <PiPhoneBold className="h-4 w-4 text-gray-400" />
                  <Text className="font-medium">{branch.phoneNumber}</Text>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <PiMapPinBold className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <Text className="text-gray-600 dark:text-gray-400 line-clamp-2">
                    {branch.fullAddress || `${branch.street}, ${branch.district}, ${branch.city}`}
                  </Text>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={routes.branches.details(branch.id)} className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full hover:border-green-600 hover:text-green-600"
                  >
                    <PiEyeBold className="me-1.5 h-4 w-4" />
                    {t("view")}
                  </Button>
                </Link>
                {branch.status === BranchStatus.PENDING && (
                  <>
                    <Popover placement="top">
                      <Popover.Trigger>
                        <Button
                          className="flex-1 bg-green-600 text-white hover:bg-black hover:text-white hover:border-black active:bg-green-700 border-transparent"
                          disabled={processingId === branch.id}
                          isLoading={processingId === branch.id}
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
                            <Text className="mb-4 text-sm text-gray-500">
                              {t("approve-branch-confirm")}
                            </Text>
                            <div className="flex items-center justify-end">
                              <Button
                                size="sm"
                                className="me-1.5 h-7 bg-green-600 text-white hover:bg-black hover:text-white active:bg-green-700"
                                onClick={() => {
                                  handleApprove(branch.id);
                                  setOpen(false);
                                }}
                              >
                                {t("yes")}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7"
                                onClick={() => setOpen(false)}
                              >
                                {t("no")}
                              </Button>
                            </div>
                          </div>
                        )}
                      </Popover.Content>
                    </Popover>

                    <Popover placement="top">
                      <Popover.Trigger>
                        <Button
                          className="flex-1 bg-red-600 text-white hover:bg-black hover:text-white hover:border-black active:bg-red-700 border-transparent"
                          disabled={processingId === branch.id}
                          isLoading={processingId === branch.id}
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
                            <Text className="mb-4 text-sm text-gray-500">
                              {t("reject-branch-confirm")}
                            </Text>
                            <div className="flex items-center justify-end">
                              <Button
                                size="sm"
                                className="me-1.5 h-7 bg-red-600 text-white hover:bg-black hover:text-white active:bg-red-700"
                                onClick={() => {
                                  handleReject(branch.id);
                                  setOpen(false);
                                }}
                              >
                                {t("yes")}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7"
                                onClick={() => setOpen(false)}
                              >
                                {t("no")}
                              </Button>
                            </div>
                          </div>
                        )}
                      </Popover.Content>
                    </Popover>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
