"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Badge, Button, Loader, Popover, Input, Select } from "rizzui";
import { PiEyeBold, PiCheckCircleBold, PiXCircleBold, PiMagnifyingGlassBold, PiSortAscendingBold, PiStorefrontDuotone } from "react-icons/pi";
import { Link, useRouter } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { getAllShops, changeShopStatus } from "@/services/shop.service";
import { getDocumentUrl } from "@/config/constants";
import {
  Shop,
  ShopStatus,
  getShopStatusLabel,
} from "@/types/shop.types";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";
import Image from "next/image";

const pageHeader = {
  title: "Shop Hub",
  breadcrumb: [
    { name: "Home", href: "/" },
    { name: "Admin", href: "#" },
    { name: "Shop Hub" },
  ],
};

function getStatusBadgeColor(status: ShopStatus) {
  switch (status) {
    case ShopStatus.APPROVED:
      return "success";
    case ShopStatus.PENDING:
      return "warning";
    case ShopStatus.REJECTED:
      return "danger";
    case ShopStatus.SUSPENDED:
    default:
      return "secondary";
  }
}

export default function ShopHubPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<any>({ value: "newest", label: "Newest First" });

  const filteredShops = useMemo(() => {
    let result = [...shops];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.description?.toLowerCase().includes(term)
      );
    }

    if (sortConfig) {
      const sortValue = sortConfig.value || sortConfig;
      result.sort((a, b) => {
        if (sortValue === "newest") return b.createdAt.localeCompare(a.createdAt);
        if (sortValue === "oldest") return a.createdAt.localeCompare(b.createdAt);
        if (sortValue === "name_asc") return a.name.localeCompare(b.name);
        if (sortValue === "name_desc") return b.name.localeCompare(a.name);
        if (sortValue === "rating") return b.averageRating - a.averageRating;
        return 0;
      });
    }
    return result;
  }, [shops, searchTerm, sortConfig]);

  const fetchShops = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllShops(session?.accessToken || "");
      setShops(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch shops");
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchShops();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [status, fetchShops, router]);

  const handleApprove = async (shopId: string) => {
    setProcessingId(shopId);
    try {
      await changeShopStatus(
        { shopId, status: ShopStatus.APPROVED },
        session?.accessToken || ""
      );
      setShops(
        shops.map((s) =>
          s.id === shopId
            ? { ...s, status: ShopStatus.APPROVED }
            : s
        )
      );
      toast.success("Shop approved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve shop");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (shopId: string) => {
    setProcessingId(shopId);
    try {
      await changeShopStatus(
        { shopId, status: ShopStatus.REJECTED },
        session?.accessToken || ""
      );
      setShops(
        shops.map((s) =>
          s.id === shopId
            ? { ...s, status: ShopStatus.REJECTED }
            : s
        )
      );
      toast.success("Shop rejected");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject shop");
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

      {shops.length > 0 && (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Search by name or description..."
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
              { label: "Highest Rating", value: "rating" },
            ]}
            value={sortConfig}
            onChange={setSortConfig}
            className="w-full md:w-48"
            prefix={<PiSortAscendingBold className="h-4 w-4" />}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shops.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <PiStorefrontDuotone className="mb-4 h-16 w-16 text-gray-400" />
            <Text className="mb-2 text-gray-500">
              No shops found.
            </Text>
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
             <Text className="mb-2">No results found for &quot;{searchTerm}&quot;</Text>
             <Button variant="text" onClick={() => setSearchTerm("")} className="text-[#1f502a]">Clear Search</Button>
          </div>
        ) : (
          filteredShops.map((shop) => (
            <div
              key={shop.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {shop.logoUrl ? (
                    <div className="relative h-12 w-12">
                      <Image
                        src={getDocumentUrl(shop.logoUrl)}
                        alt={shop.name}
                        fill
                        className="rounded-full object-cover"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                      <PiStorefrontDuotone className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <Title as="h4" className="mb-1 text-lg font-semibold">
                      {shop.name}
                    </Title>
                    <Text className="line-clamp-1 text-sm text-gray-500">
                      {shop.description || "No description"}
                    </Text>
                  </div>
                </div>
                <Badge
                  variant="flat"
                  color={getStatusBadgeColor(shop.status)}
                  className="capitalize"
                >
                  {getShopStatusLabel(shop.status)}
                </Badge>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">Rating:</Text>
                  <Text className="font-medium">{shop.averageRating.toFixed(1)} ⭐</Text>
                </div>
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">Total Orders:</Text>
                  <Text className="font-medium">{shop.totalOrders}</Text>
                </div>
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">Commission Rate:</Text>
                  <Text className="font-medium">{shop.commissionRate}%</Text>
                </div>
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">Featured:</Text>
                  <Text className="font-medium">{shop.isFeatured ? "Yes" : "No"}</Text>
                </div>
              </div>

              <div className="flex gap-2">
                {shop.status === ShopStatus.PENDING && (
                  <>
                    <Popover placement="top">
                      <Popover.Trigger>
                        <Button
                          className="flex-1 bg-green-600 text-white hover:bg-black hover:text-white hover:border-black active:bg-green-700 border-transparent"
                          disabled={processingId === shop.id}
                          isLoading={processingId === shop.id}
                        >
                          <PiCheckCircleBold className="me-1.5 h-4 w-4" />
                          Approve
                        </Button>
                      </Popover.Trigger>
                      <Popover.Content className="z-[9999] shadow-xl">
                        {({ setOpen }) => (
                          <div className="w-56 p-3">
                            <Title as="h6" className="mb-2 text-base font-semibold">Approve Shop?</Title>
                            <Text className="mb-4 text-sm text-gray-500">Are you sure you want to approve this shop?</Text>
                            <div className="flex items-center justify-end">
                              <Button 
                                size="sm"
                                className="me-1.5 h-7 bg-green-600 text-white hover:bg-black hover:text-white active:bg-green-700"
                                onClick={() => { 
                                  handleApprove(shop.id); 
                                  setOpen(false); 
                                }}
                              >
                                Yes
                              </Button>
                              <Button size="sm" variant="outline" className="h-7" onClick={() => setOpen(false)}>No</Button>
                            </div>
                          </div>
                        )}
                      </Popover.Content>
                    </Popover>

                    <Popover placement="top">
                      <Popover.Trigger>
                        <Button
                          className="flex-1 bg-red-600 text-white hover:bg-black hover:text-white hover:border-black active:bg-red-700 border-transparent"
                          disabled={processingId === shop.id}
                          isLoading={processingId === shop.id}
                        >
                          <PiXCircleBold className="me-1.5 h-4 w-4" />
                          Reject
                        </Button>
                      </Popover.Trigger>
                      <Popover.Content className="z-[9999] shadow-xl">
                        {({ setOpen }) => (
                          <div className="w-56 p-3">
                            <Title as="h6" className="mb-2 text-base font-semibold">Reject Shop?</Title>
                            <Text className="mb-4 text-sm text-gray-500">Are you sure you want to reject this shop?</Text>
                            <div className="flex items-center justify-end">
                              <Button 
                                size="sm"
                                className="me-1.5 h-7 bg-red-600 text-white hover:bg-black hover:text-white active:bg-red-700"
                                onClick={() => { 
                                  handleReject(shop.id); 
                                  setOpen(false); 
                                }}
                              >
                                Yes
                              </Button>
                              <Button size="sm" variant="outline" className="h-7" onClick={() => setOpen(false)}>No</Button>
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
