"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Badge, Button, Loader } from "rizzui";
import {
  PiCheckCircleBold,
  PiXCircleBold,
  PiArrowLeftBold,
  PiFileBold,
} from "react-icons/pi";
import { Link } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { getDocumentUrl } from "@/config/constants";
import {
  getDriverById,
  getDriverDocuments,
  changeDriverAccountStatus,
  changeDriverDocumentStatus,
} from "@/services/driver.service";
import {
  Driver,
  DriverDocument,
  DeliveryAccountStatus,
  DocumentVerificationStatus,
  getDeliveryAccountStatusLabel,
  getDeliveryAvailabilityStatusLabel,
  getVehicleTypeLabel,
  getDriverDocumentTypeLabel,
  getDocumentVerificationStatusLabel,
} from "@/types/driver.types";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/routing";

interface DriverDetailsPageProps {
  driverId: string;
}

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

function getDocStatusBadgeColor(status: DocumentVerificationStatus) {
  switch (status) {
    case DocumentVerificationStatus.APPROVED:
      return "success";
    case DocumentVerificationStatus.PENDING:
      return "warning";
    case DocumentVerificationStatus.REJECTED:
      return "danger";
    default:
      return "secondary";
  }
}

export default function DriverDetailsPage({ driverId }: DriverDetailsPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [documents, setDocuments] = useState<DriverDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pageHeader = {
    title: driver ? `${driver.firstName} ${driver.lastName}` : "Driver Details",
    breadcrumb: [
      { name: "Home", href: "/" },
      { name: "Admin", href: "#" },
      { name: "Drivers", href: routes.drivers.list },
      { name: "Details" },
    ],
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchDriverDetails();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [session, status, driverId]);

  const fetchDriverDetails = async () => {
    try {
      setIsLoading(true);
      const [driverData, docsData] = await Promise.all([
        getDriverById(driverId, session?.accessToken || ""),
        getDriverDocuments(driverId, session?.accessToken || ""),
      ]);
      setDriver(driverData);
      setDocuments(docsData);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch driver details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveDriver = async () => {
    if (!driver) return;
    setProcessingId("driver");
    try {
      await changeDriverAccountStatus(
        { driverId: driver.id, deliveryAccountStatus: DeliveryAccountStatus.APPROVED },
        session?.accessToken || ""
      );
      setDriver({ ...driver, deliveryAccountStatus: DeliveryAccountStatus.APPROVED });
      toast.success("Driver approved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve driver");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectDriver = async () => {
    if (!driver) return;
    setProcessingId("driver");
    try {
      await changeDriverAccountStatus(
        { driverId: driver.id, deliveryAccountStatus: DeliveryAccountStatus.REJECTED },
        session?.accessToken || ""
      );
      setDriver({ ...driver, deliveryAccountStatus: DeliveryAccountStatus.REJECTED });
      toast.success("Driver rejected");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject driver");
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveDocument = async (docId: string) => {
    setProcessingId(docId);
    try {
      await changeDriverDocumentStatus(
        { documentId: docId, verificationStatus: DocumentVerificationStatus.APPROVED },
        session?.accessToken || ""
      );
      setDocuments(
        documents.map((d) =>
          d.id === docId
            ? { ...d, verificationStatus: DocumentVerificationStatus.APPROVED }
            : d
        )
      );
      toast.success("Document approved");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve document");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectDocument = async (docId: string) => {
    setProcessingId(docId);
    try {
      await changeDriverDocumentStatus(
        {
          documentId: docId,
          verificationStatus: DocumentVerificationStatus.REJECTED,
          rejectionReason: "Document does not meet requirements",
        },
        session?.accessToken || ""
      );
      setDocuments(
        documents.map((d) =>
          d.id === docId
            ? { ...d, verificationStatus: DocumentVerificationStatus.REJECTED }
            : d
        )
      );
      toast.success("Document rejected");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject document");
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

  if (!driver) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center">
        <Text className="mb-4 text-gray-500">Driver not found</Text>
        <Link href={routes.drivers.list}>
          <Button>
            <PiArrowLeftBold className="me-1.5 h-4 w-4" />
            Back to Drivers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
        isStaticTitle={!!driver}
      >
        <Link href={routes.drivers.list}>
          <Button variant="outline" className="mt-4 sm:mt-0">
            <PiArrowLeftBold className="me-1.5 h-4 w-4" />
            Back to Drivers
          </Button>
        </Link>
      </PageHeader>

      {/* Driver Info Card */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <Title as="h3" className="mb-2 text-xl font-semibold">
              Driver Information
            </Title>
            <Text className="text-gray-500">{driver.email}</Text>
          </div>
          <Badge
            variant="flat"
            color={getStatusBadgeColor(driver.deliveryAccountStatus)}
            className="capitalize"
          >
            {getDeliveryAccountStatusLabel(driver.deliveryAccountStatus)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Text className="text-sm text-gray-500">Phone</Text>
            <Text className="font-medium">{driver.phoneNumber}</Text>
          </div>
          <div>
            <Text className="text-sm text-gray-500">Vehicle Type</Text>
            <Text className="font-medium">{getVehicleTypeLabel(driver.vehicleType)}</Text>
          </div>
          <div>
            <Text className="text-sm text-gray-500">Availability</Text>
            <Text className="font-medium">
              {getDeliveryAvailabilityStatusLabel(driver.deliveryAvailabilityStatus)}
            </Text>
          </div>
          <div>
            <Text className="text-sm text-gray-500">Total Deliveries</Text>
            <Text className="font-medium">{driver.totalDeliveries}</Text>
          </div>
          <div>
            <Text className="text-sm text-gray-500">Total Earnings</Text>
            <Text className="font-medium">{driver.totalEarnings.toFixed(2)} SAR</Text>
          </div>
          <div>
            <Text className="text-sm text-gray-500">Average Rating</Text>
            <Text className="font-medium">{driver.averageRating.toFixed(1)} ★</Text>
          </div>
        </div>

        {driver.deliveryAccountStatus === DeliveryAccountStatus.PENDING && (
          <div className="mt-6 flex gap-4">
            <Button
              className="bg-green-600 text-white hover:bg-black hover:text-white active:bg-green-700"
              onClick={handleApproveDriver}
              disabled={processingId === "driver"}
            >
              <PiCheckCircleBold className="me-1.5 h-4 w-4" />
              Approve Driver
            </Button>
            <Button
              variant="outline"
              className="bg-red-600 text-white hover:bg-black hover:text-white hover:border-black active:bg-red-700 border-transparent"
              onClick={handleRejectDriver}
              disabled={processingId === "driver"}
            >
              <PiXCircleBold className="me-1.5 h-4 w-4" />
              Reject Driver
            </Button>
          </div>
        )}
      </div>

      {/* Documents Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <Title as="h3" className="mb-4 text-xl font-semibold">
          Documents
        </Title>

        {documents.length === 0 ? (
          <Text className="text-gray-500">No documents uploaded yet.</Text>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-600"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <PiFileBold className="h-5 w-5 text-gray-500" />
                    <Text className="font-medium">
                      {getDriverDocumentTypeLabel(doc.documentType)}
                    </Text>
                  </div>
                  <Badge
                    variant="flat"
                    color={getDocStatusBadgeColor(doc.verificationStatus)}
                    className="capitalize"
                  >
                    {getDocumentVerificationStatusLabel(doc.verificationStatus)}
                  </Badge>
                </div>

                {doc.documentUrl && (
                  <a
                    href={getDocumentUrl(doc.documentUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-3 block text-sm text-blue-600 hover:underline"
                  >
                    View Document
                  </a>
                )}

                {doc.verificationStatus === DocumentVerificationStatus.PENDING && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 text-white hover:bg-black hover:text-white active:bg-green-700"
                      onClick={() => handleApproveDocument(doc.id)}
                      disabled={processingId === doc.id}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-red-600 text-white hover:bg-black hover:text-white hover:border-black active:bg-red-700 border-transparent"
                      onClick={() => handleRejectDocument(doc.id)}
                      disabled={processingId === doc.id}
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {doc.rejectionReason && (
                  <Text className="mt-2 text-sm text-red-500">
                    Rejection reason: {doc.rejectionReason}
                  </Text>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
