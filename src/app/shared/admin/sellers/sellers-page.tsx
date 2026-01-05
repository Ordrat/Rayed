"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Badge, Button, Loader } from "rizzui";
import { PiEyeBold, PiCheckCircleBold, PiXCircleBold } from "react-icons/pi";
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
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sellers.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Text className="mb-4 text-gray-500">
              No sellers found.
            </Text>
          </div>
        ) : (
          sellers.map((seller) => (
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
                    <Button
                      variant="outline"
                      className="flex-1 hover:border-green-600 hover:bg-green-600 hover:text-white"
                      onClick={() => handleApprove(seller.id)}
                      disabled={processingId === seller.id}
                    >
                      <PiCheckCircleBold className="me-1.5 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 hover:border-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => handleReject(seller.id)}
                      disabled={processingId === seller.id}
                    >
                      <PiXCircleBold className="me-1.5 h-4 w-4" />
                      Reject
                    </Button>
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
