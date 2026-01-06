"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Badge, Button, Loader, Popover, Input, Select } from "rizzui";
import { PiPlusBold, PiEyeBold, PiCheckCircleBold, PiXCircleBold, PiMagnifyingGlassBold, PiSortAscendingBold } from "react-icons/pi";
import { Link } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { getAllSellers, changeSellerAccountStatus } from "@/services/seller.service";
import {
  Seller,
  SellerAccountStatus,
  getSellerAccountStatusLabel,
} from "@/types/seller.types";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/routing";

const pageHeader = {
  title: "Sellers Management",
  breadcrumb: [
    { name: "Home", href: "/" },
    { name: "Admin", href: "#" },
    { name: "Sellers" },
  ],
};

function getStatusBadgeColor(status: SellerAccountStatus) {
  switch (status) {
    case SellerAccountStatus.APPROVED:
      return "success";
    case SellerAccountStatus.PENDING:
      return "warning";
    case SellerAccountStatus.REJECTED:
      return "danger";
    case SellerAccountStatus.SUSPENDED:
    default:
      return "secondary";
  }
}

export default function SellersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<any>({ value: "newest", label: "Newest First" });

  const filteredSellers = useMemo(() => {
    let result = [...sellers];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.firstName.toLowerCase().includes(term) ||
          s.lastName.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term) ||
          s.phoneNumber.includes(term)
      );
    }

    if (sortConfig) {
      const sortValue = sortConfig.value || sortConfig;
      result.sort((a, b) => {
        if (sortValue === "newest") return b.createdAt.localeCompare(a.createdAt);
        if (sortValue === "oldest") return a.createdAt.localeCompare(b.createdAt);
        if (sortValue === "name_asc") return a.firstName.localeCompare(b.firstName);
        if (sortValue === "name_desc") return b.firstName.localeCompare(a.firstName);
        return 0;
      });
    }
    return result;
  }, [sellers, searchTerm, sortConfig]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSellers();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [session, status, router]);

  const fetchSellers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllSellers(session?.accessToken || "");
      setSellers(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch sellers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (sellerId: string) => {
    setProcessingId(sellerId);
    try {
      await changeSellerAccountStatus(
        { sellerId, accountStatus: SellerAccountStatus.APPROVED },
        session?.accessToken || ""
      );
      setSellers(
        sellers.map((s) =>
          s.id === sellerId
            ? { ...s, accountStatus: SellerAccountStatus.APPROVED }
            : s
        )
      );
      toast.success("Seller approved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve seller");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (sellerId: string) => {
    setProcessingId(sellerId);
    try {
      await changeSellerAccountStatus(
        { sellerId, accountStatus: SellerAccountStatus.REJECTED },
        session?.accessToken || ""
      );
      setSellers(
        sellers.map((s) =>
          s.id === sellerId
            ? { ...s, accountStatus: SellerAccountStatus.REJECTED }
            : s
        )
      );
      toast.success("Seller rejected");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject seller");
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
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link href={routes.sellers.create}>
          <Button className="mt-4 w-full bg-[#1f502a] hover:bg-[#143219] sm:mt-0 sm:w-auto">
            <PiPlusBold className="me-1.5 h-4 w-4" />
            Add Seller
          </Button>
        </Link>
      </PageHeader>

      {sellers.length > 0 && (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Search by name, email or phone..."
            prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3"
            clearable
            onClear={() => setSearchTerm("")}
          />
          <Select
            options={[
              { label: "Newest First", value: "newest" },
              { label: "Oldest First", value: "oldest" },
              { label: "Name (A-Z)", value: "name_asc" },
              { label: "Name (Z-A)", value: "name_desc" },
            ]}
            value={sortConfig}
            onChange={setSortConfig}
            className="w-full md:w-48"
            prefix={<PiSortAscendingBold className="h-4 w-4" />}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sellers.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Text className="mb-4 text-gray-500">
              No sellers found. Create one to get started.
            </Text>
            <Link href={routes.sellers.create}>
              <Button className="bg-[#1f502a] hover:bg-[#143219]">
                <PiPlusBold className="me-1.5 h-4 w-4" />
                Create First Seller
              </Button>
            </Link>
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
             <Text className="mb-2">No results found for &quot;{searchTerm}&quot;</Text>
             <Button variant="text" onClick={() => setSearchTerm("")} className="text-[#1f502a]">Clear Search</Button>
          </div>
        ) : (
          filteredSellers.map((seller) => (
            <div
              key={seller.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <Title as="h4" className="mb-1 text-lg font-semibold">
                    {seller.firstName} {seller.lastName}
                  </Title>
                  <Text className="text-sm text-gray-500">{seller.email}</Text>
                </div>
                <Badge
                  variant="flat"
                  color={getStatusBadgeColor(seller.accountStatus)}
                  className="capitalize"
                >
                  {getSellerAccountStatusLabel(seller.accountStatus)}
                </Badge>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">Phone:</Text>
                  <Text className="font-medium">{seller.phoneNumber}</Text>
                </div>
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">Bank:</Text>
                  <Text className="font-medium">{seller.bankName}</Text>
                </div>
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">Total Earnings:</Text>
                  <Text className="font-medium">
                    {seller.totalEarnings.toFixed(2)} SAR
                  </Text>
                </div>
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">Commission Rate:</Text>
                  <Text className="font-medium">{seller.commissionRate}%</Text>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={routes.sellers.details(seller.id)} className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full hover:border-green-600 hover:text-green-600"
                  >
                    <PiEyeBold className="me-1.5 h-4 w-4" />
                    View
                  </Button>
                </Link>
                {seller.accountStatus === SellerAccountStatus.PENDING && (
                  <>
                    <Popover placement="top">
                      <Popover.Trigger>
                        <Button
                          className="flex-1 bg-green-600 text-white hover:bg-black hover:text-white hover:border-black active:bg-green-700 border-transparent"
                          disabled={processingId === seller.id}
                          isLoading={processingId === seller.id}
                        >
                          <PiCheckCircleBold className="me-1.5 h-4 w-4" />
                          Approve
                        </Button>
                      </Popover.Trigger>
                      <Popover.Content className="z-50 shadow-xl">
                        {({ setOpen }) => (
                          <div className="w-56 p-3">
                            <Title as="h6" className="mb-2 text-base font-semibold">Approve Seller?</Title>
                            <Text className="mb-4 text-sm text-gray-500">Are you sure you want to approve this seller?</Text>
                            <div className="flex justify-end gap-2">
                              <Button 
                                className="bg-green-600 text-white hover:bg-black hover:text-white active:bg-green-700"
                                onClick={() => { 
                                  handleApprove(seller.id); 
                                  setOpen(false); 
                                }}
                              >
                                Yes
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setOpen(false)}>No</Button>
                            </div>
                          </div>
                        )}
                      </Popover.Content>
                    </Popover>

                    <Popover placement="top">
                      <Popover.Trigger>
                        <Button
                          className="flex-1 bg-red-600 text-white hover:bg-black hover:text-white hover:border-black active:bg-red-700 border-transparent"
                          disabled={processingId === seller.id}
                          isLoading={processingId === seller.id}
                        >
                          <PiXCircleBold className="me-1.5 h-4 w-4" />
                          Reject
                        </Button>
                      </Popover.Trigger>
                      <Popover.Content className="z-50 shadow-xl">
                        {({ setOpen }) => (
                          <div className="w-56 p-3">
                            <Title as="h6" className="mb-2 text-base font-semibold">Reject Seller?</Title>
                            <Text className="mb-4 text-sm text-gray-500">Are you sure you want to reject this seller?</Text>
                            <div className="flex justify-end gap-2">
                              <Button 
                                className="bg-red-600 text-white hover:bg-black hover:text-white active:bg-red-700"
                                onClick={() => { 
                                  handleReject(seller.id); 
                                  setOpen(false); 
                                }}
                              >
                                Yes
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setOpen(false)}>No</Button>
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
