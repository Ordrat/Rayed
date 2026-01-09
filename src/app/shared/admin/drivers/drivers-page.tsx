"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Badge, Button, Loader, Input, Select, Popover } from "rizzui";
import { PiPlusBold, PiEyeBold, PiCheckCircleBold, PiXCircleBold, PiMagnifyingGlassBold, PiSortAscendingBold } from "react-icons/pi";
import { Link } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { getAllDrivers, changeDriverAccountStatus } from "@/services/driver.service";
import {
  Driver,
  DeliveryAccountStatus,
  getDeliveryAccountStatusLabel,
  getVehicleTypeLabel,
} from "@/types/driver.types";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/routing";

const pageHeader = {
  title: "Drivers Management",
  breadcrumb: [
    { name: "Home", href: "/" },
    { name: "Admin", href: "#" },
    { name: "Drivers" },
  ],
};

function getStatusBadgeColor(status: DeliveryAccountStatus) {
  switch (status) {
    case DeliveryAccountStatus.APPROVED:
      return "success";
    case DeliveryAccountStatus.PENDING:
      return "warning";
    case DeliveryAccountStatus.REJECTED:
      return "danger";
    case DeliveryAccountStatus.SUSPENDED:
    default:
      return "secondary";
  }
}

export default function DriversPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<any>({ value: "newest", label: "Newest First" });

  const filteredDrivers = useMemo(() => {
    let result = [...drivers];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.firstName.toLowerCase().includes(term) ||
          d.lastName.toLowerCase().includes(term) ||
          d.email.toLowerCase().includes(term) ||
          d.phoneNumber.includes(term)
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
  }, [drivers, searchTerm, sortConfig]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDrivers();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [session, status, router]);

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllDrivers(session?.accessToken || "");
      setDrivers(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch drivers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (driverId: string) => {
    setProcessingId(driverId);
    try {
      await changeDriverAccountStatus(
        { driverId, deliveryAccountStatus: DeliveryAccountStatus.APPROVED },
        session?.accessToken || ""
      );
      setDrivers(
        drivers.map((d) =>
          d.id === driverId
            ? { ...d, deliveryAccountStatus: DeliveryAccountStatus.APPROVED }
            : d
        )
      );
      toast.success("Driver approved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve driver");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (driverId: string) => {
    setProcessingId(driverId);
    try {
      await changeDriverAccountStatus(
        { driverId, deliveryAccountStatus: DeliveryAccountStatus.REJECTED },
        session?.accessToken || ""
      );
      setDrivers(
        drivers.map((d) =>
          d.id === driverId
            ? { ...d, deliveryAccountStatus: DeliveryAccountStatus.REJECTED }
            : d
        )
      );
      toast.success("Driver rejected");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject driver");
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
        <Link href={routes.drivers.create}>
          <Button className="mt-4 w-full bg-[#1f502a] hover:bg-[#143219] sm:mt-0 sm:w-auto">
            <PiPlusBold className="me-1.5 h-4 w-4" />
            Add Driver
          </Button>
        </Link>
      </PageHeader>

      {drivers.length > 0 && (
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
        {drivers.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Text className="mb-4 text-gray-500">
              No drivers found. Create one to get started.
            </Text>
            <Link href={routes.drivers.create}>
              <Button className="bg-[#1f502a] hover:bg-[#143219]">
                <PiPlusBold className="me-1.5 h-4 w-4" />
                Create First Driver
              </Button>
            </Link>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
             <Text className="mb-2">No results found for &quot;{searchTerm}&quot;</Text>
             <Button variant="text" onClick={() => setSearchTerm("")} className="text-[#1f502a]">Clear Search</Button>
          </div>
        ) : (
          filteredDrivers.map((driver) => (
            <div
              key={driver.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <Title as="h4" className="mb-1 text-lg font-semibold">
                    {driver.firstName} {driver.lastName}
                  </Title>
                  <Text className="text-sm text-gray-500">{driver.email}</Text>
                </div>
                <Badge
                  variant="flat"
                  color={getStatusBadgeColor(driver.deliveryAccountStatus)}
                  className="capitalize"
                >
                  {getDeliveryAccountStatusLabel(driver.deliveryAccountStatus)}
                </Badge>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">Phone:</Text>
                  <Text className="font-medium">{driver.phoneNumber}</Text>
                </div>
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">Vehicle:</Text>
                  <Text className="font-medium">
                    {getVehicleTypeLabel(driver.vehicleType)}
                  </Text>
                </div>
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">Total Deliveries:</Text>
                  <Text className="font-medium">{driver.totalDeliveries}</Text>
                </div>
                <div className="flex justify-between text-sm">
                  <Text className="text-gray-500">Rating:</Text>
                  <Text className="font-medium">
                    {driver.averageRating.toFixed(1)} ★
                  </Text>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={routes.drivers.details(driver.id)} className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full hover:border-green-600 hover:text-green-600"
                  >
                    <PiEyeBold className="me-1.5 h-4 w-4" />
                    View
                  </Button>
                </Link>
                {driver.deliveryAccountStatus === DeliveryAccountStatus.PENDING && (
                  <>
                    <Popover placement="top">
                      <Popover.Trigger>
                        <Button
                          className="flex-1 bg-green-600 text-white hover:bg-black hover:text-white hover:border-black active:bg-green-700 border-transparent"
                          disabled={processingId === driver.id}
                        >
                          <PiCheckCircleBold className="me-1.5 h-4 w-4" />
                          Approve
                        </Button>
                      </Popover.Trigger>
                      <Popover.Content className="z-[9999] shadow-xl">
                        {({ setOpen }) => (
                          <div className="w-56 p-3">
                            <Title as="h6" className="mb-2 text-base font-semibold">Approve Driver?</Title>
                            <Text className="mb-4 text-sm text-gray-500">Are you sure you want to approve this driver?</Text>
                            <div className="flex items-center justify-end">
                              <Button
                                size="sm"
                                className="me-1.5 h-7 bg-green-600 text-white hover:bg-black hover:text-white active:bg-green-700"
                                onClick={() => {
                                  handleApprove(driver.id);
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
                          disabled={processingId === driver.id}
                        >
                          <PiXCircleBold className="me-1.5 h-4 w-4" />
                          Reject
                        </Button>
                      </Popover.Trigger>
                      <Popover.Content className="z-[9999] shadow-xl">
                        {({ setOpen }) => (
                          <div className="w-56 p-3">
                            <Title as="h6" className="mb-2 text-base font-semibold">Reject Driver?</Title>
                            <Text className="mb-4 text-sm text-gray-500">Are you sure you want to reject this driver?</Text>
                            <div className="flex items-center justify-end">
                              <Button
                                size="sm"
                                className="me-1.5 h-7 bg-red-600 text-white hover:bg-black hover:text-white active:bg-red-700"
                                onClick={() => {
                                  handleReject(driver.id);
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
