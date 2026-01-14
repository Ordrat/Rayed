"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Badge, Button, Loader, Popover } from "rizzui";
import {
  PiCheckCircleBold,
  PiXCircleBold,
  PiArrowLeftBold,
  PiFileBold,
  PiCarProfileBold,
  PiTrendUpBold,
} from "react-icons/pi";
import { Link, useRouter } from "@/i18n/routing";
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
import { useTranslations } from "next-intl";
import WidgetCard from "@core/components/cards/widget-card";
import DocumentCard from "@/app/shared/document-card";

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
  const t = useTranslations("common");
  const [driver, setDriver] = useState<Driver | null>(null);
  const [documents, setDocuments] = useState<DriverDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pageHeader = {
    title: driver ? `${driver.firstName} ${driver.lastName}` : t("Driver Details"),
    breadcrumb: [
      { name: t("Home"), href: "/" },
      { name: t("Admin"), href: "#" },
      { name: t("Drivers"), href: routes.drivers.list },
      { name: t("Details") },
    ],
  };

  const fetchDriverDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const [driverData, docsData] = await Promise.all([
        getDriverById(driverId, session?.accessToken || ""),
        getDriverDocuments(driverId, session?.accessToken || ""),
      ]);
      setDriver(driverData);
      setDocuments(docsData);
    } catch (error: any) {
      toast.error(error.message || t("failed-to-fetch-driver-details"));
    } finally {
      setIsLoading(false);
    }
  }, [driverId, session?.accessToken, t]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDriverDetails();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [status, fetchDriverDetails, router]);

  const handleApproveDriver = async () => {
    if (!driver) return;
    setProcessingId("driver");
    try {
      await changeDriverAccountStatus(
        { driverId: driver.id, deliveryAccountStatus: DeliveryAccountStatus.APPROVED },
        session?.accessToken || ""
      );
      setDriver({ ...driver, deliveryAccountStatus: DeliveryAccountStatus.APPROVED });
      toast.success(t("driver-approved-successfully"));
    } catch (error: any) {
      toast.error(error.message || t("failed-to-approve-driver"));
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
      toast.success(t("driver-rejected-successfully"));
    } catch (error: any) {
      toast.error(error.message || t("failed-to-reject-driver"));
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
      toast.success(t("document-approved-successfully"));
    } catch (error: any) {
      toast.error(error.message || t("failed-to-approve-document"));
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
          rejectionReason: t("document-rejection-default-reason"),
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
      toast.success(t("document-rejected-successfully"));
    } catch (error: any) {
      toast.error(error.message || t("failed-to-reject-document"));
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
        <Text className="mb-4 text-gray-500">{t("Driver not found")}</Text>
        <Link href={routes.drivers.list}>
          <Button>
            <PiArrowLeftBold className="me-1.5 h-4 w-4" />
            {t("Back to Drivers")}
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
            {t("Back to Drivers")}
          </Button>
        </Link>
      </PageHeader>

      {/* Driver Info Card */}
      <WidgetCard 
        title={t("Driver Information")}
        description={driver.email}
        action={
          <Badge
            variant="flat"
            color={getStatusBadgeColor(driver.deliveryAccountStatus)}
            className="capitalize"
          >
            {getDeliveryAccountStatusLabel(driver.deliveryAccountStatus)}
          </Badge>
        }
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
          
          {/* Personal Group */}
          <div className="space-y-4">
             <Title as="h6" className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">{t("Personal Information")}</Title>
             <div>
               <Text className="text-sm text-gray-500">{t("Phone")}</Text>
               <Text className="font-medium text-lg">{driver.phoneNumber}</Text>
             </div>
             <div>
               <Text className="text-sm text-gray-500">{t("Availability")}</Text>
               <Text className="font-medium">
                {getDeliveryAvailabilityStatusLabel(driver.deliveryAvailabilityStatus)}
               </Text>
             </div>
          </div>

          {/* Vehicle Group */}
          <div className="space-y-4">
             <Title as="h6" className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">{t("Vehicle Information")}</Title>
             <div>
               <Text className="text-sm text-gray-500 flex items-center gap-1"><PiCarProfileBold /> {t("Vehicle Type")}</Text>
               <Text className="font-medium">{getVehicleTypeLabel(driver.vehicleType)}</Text>
             </div>
          </div>

          {/* Performance Group */}
          <div className="space-y-4">
             <Title as="h6" className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">{t("Performance")}</Title>
             <div>
               <Text className="text-sm text-gray-500 flex items-center gap-1"><PiTrendUpBold /> {t("Total Deliveries")}</Text>
               <Text className="font-medium">{driver.totalDeliveries}</Text>
             </div>
             <div>
               <Text className="text-sm text-gray-500">{t("Total Earnings")}</Text>
               <Text className="font-medium text-green-600 font-bold">{driver.totalEarnings.toFixed(2)} {t("SAR")}</Text>
             </div>
             <div>
               <Text className="text-sm text-gray-500">{t("Average Rating")}</Text>
               <Text className="font-medium">{driver.averageRating.toFixed(1)} ★</Text>
             </div>
          </div>
        </div>

        {driver.deliveryAccountStatus === DeliveryAccountStatus.PENDING && (
          <div className="mt-8 flex gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
            <Popover placement="top">
              <Popover.Trigger>
                <Button
                  className="flex-1 bg-green-600 text-white hover:bg-black hover:text-white active:bg-green-700"
                  disabled={processingId === "driver"}
                >
                  <PiCheckCircleBold className="me-1.5 h-4 w-4" />
                  {t("Approve Driver")}
                </Button>
              </Popover.Trigger>
              <Popover.Content className="z-[9999] shadow-xl">
                {({ setOpen }) => (
                  <div className="w-56 p-3">
                    <Title as="h6" className="mb-2 text-base font-semibold">{t("Approve Driver")}?</Title>
                    <Text className="mb-4 text-sm text-gray-500">{t("approve-driver-confirm")}</Text>
                    <div className="flex items-center justify-end">
                      <Button 
                        size="sm"
                        className="me-1.5 h-7 bg-green-600 text-white hover:bg-black hover:text-white active:bg-green-700"
                        onClick={() => { 
                          handleApproveDriver(); 
                          setOpen(false); 
                        }}
                      >
                        {t("text-yes")}
                      </Button>
                      <Button size="sm" variant="outline" className="h-7" onClick={() => setOpen(false)}>{t("text-no")}</Button>
                    </div>
                  </div>
                )}
              </Popover.Content>
            </Popover>

            <Popover placement="top">
              <Popover.Trigger>
                <Button
                  variant="outline"
                  className="flex-1 bg-red-600 text-white hover:bg-black hover:text-white hover:border-black active:bg-red-700 border-transparent"
                  disabled={processingId === "driver"}
                >
                  <PiXCircleBold className="me-1.5 h-4 w-4" />
                  {t("Reject Driver")}
                </Button>
              </Popover.Trigger>
              <Popover.Content className="z-[9999] shadow-xl">
                {({ setOpen }) => (
                  <div className="w-56 p-3">
                    <Title as="h6" className="mb-2 text-base font-semibold">{t("Reject Driver")}?</Title>
                    <Text className="mb-4 text-sm text-gray-500">{t("reject-driver-confirm")}</Text>
                    <div className="flex items-center justify-end">
                      <Button 
                        size="sm"
                        className="me-1.5 h-7 bg-red-600 text-white hover:bg-black hover:text-white active:bg-red-700"
                        onClick={() => { 
                          handleRejectDriver(); 
                          setOpen(false); 
                        }}
                      >
                        {t("text-yes")}
                      </Button>
                      <Button size="sm" variant="outline" className="h-7" onClick={() => setOpen(false)}>{t("text-no")}</Button>
                    </div>
                  </div>
                )}
              </Popover.Content>
            </Popover>
          </div>
        )}
      </WidgetCard>





      {/* Documents Section */}
      <WidgetCard title={t("Documents")} className="mt-6">
        {documents.length === 0 ? (
          <Text className="text-gray-500">{t("no-documents-uploaded")}</Text>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                title={getDriverDocumentTypeLabel(doc.documentType)}
                statusLabel={getDocumentVerificationStatusLabel(doc.verificationStatus)}
                statusColor={getDocStatusBadgeColor(doc.verificationStatus)}
                documentUrl={doc.documentUrl}
                rejectionReason={doc.rejectionReason}
                onApprove={() => handleApproveDocument(doc.id)}
                onReject={() => handleRejectDocument(doc.id)}
                isProcessing={processingId === doc.id}
                showActions={doc.verificationStatus === DocumentVerificationStatus.PENDING}
              />
            ))}
          </div>
        )}
      </WidgetCard>
    </>
  );
}
