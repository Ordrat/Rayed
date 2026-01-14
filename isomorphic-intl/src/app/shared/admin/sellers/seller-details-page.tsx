"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Title, Text, Badge, Button, Loader, Popover } from "rizzui";
import {
  PiCheckCircleBold,
  PiXCircleBold,
  PiArrowLeftBold,
  PiFileBold,
  PiBankBold,
  PiMoneyBold,
  PiCalendarBlankBold,
} from "react-icons/pi";
import { Link, useRouter } from "@/i18n/routing";
import { routes } from "@/config/routes";
import { getDocumentUrl } from "@/config/constants";
import {
  getSellerById,
  getSellerDocuments,
  changeSellerAccountStatus,
  changeSellerDocumentStatus,
} from "@/services/seller.service";
import {
  Seller,
  SellerDocument,
  SellerAccountStatus,
  DocumentVerificationStatus,
  getSellerAccountStatusLabel,
  getSellerDocumentTypeLabel,
  getDocumentVerificationStatusLabel,
} from "@/types/seller.types";
import PageHeader from "@/app/shared/page-header";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import WidgetCard from "@core/components/cards/widget-card";
import DocumentCard from "@/app/shared/document-card";

interface SellerDetailsPageProps {
  sellerId: string;
}

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

export default function SellerDetailsPage({ sellerId }: SellerDetailsPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("common");
  const [seller, setSeller] = useState<Seller | null>(null);
  const [documents, setDocuments] = useState<SellerDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pageHeader = {
    title: seller ? `${seller.firstName} ${seller.lastName}` : t("Seller Details"),
    breadcrumb: [
      { name: t("Home"), href: "/" },
      { name: t("Admin"), href: "#" },
      { name: t("Sellers"), href: routes.sellers.list },
      { name: t("Details") },
    ],
  };

  const fetchSellerDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const [sellerData, docsData] = await Promise.all([
        getSellerById(sellerId, session?.accessToken || ""),
        getSellerDocuments(sellerId, session?.accessToken || ""),
      ]);
      setSeller(sellerData);
      setDocuments(docsData);
    } catch (error: any) {
      toast.error(error.message || t("failed-to-fetch-seller-details"));
    } finally {
      setIsLoading(false);
    }
  }, [sellerId, session?.accessToken, t]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSellerDetails();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [status, fetchSellerDetails, router]);

  const handleApproveSeller = async () => {
    if (!seller) return;
    setProcessingId("seller");
    try {
      await changeSellerAccountStatus(
        { sellerId: seller.id, accountStatus: SellerAccountStatus.APPROVED },
        session?.accessToken || ""
      );
      setSeller({ ...seller, accountStatus: SellerAccountStatus.APPROVED });
      toast.success(t("seller-approved-successfully"));
    } catch (error: any) {
      toast.error(error.message || t("failed-to-approve-seller"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSeller = async () => {
    if (!seller) return;
    setProcessingId("seller");
    try {
      await changeSellerAccountStatus(
        { sellerId: seller.id, accountStatus: SellerAccountStatus.REJECTED },
        session?.accessToken || ""
      );
      setSeller({ ...seller, accountStatus: SellerAccountStatus.REJECTED });
      toast.success(t("seller-rejected-successfully"));
    } catch (error: any) {
      toast.error(error.message || t("failed-to-reject-seller"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveSellerDocument = async (docId: string) => {
      setProcessingId(docId);
      try {
        await changeSellerDocumentStatus(
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
      await changeSellerDocumentStatus(
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

  if (!seller) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center">
        <Text className="mb-4 text-gray-500">{t("Seller not found")}</Text>
        <Link href={routes.sellers.list}>
          <Button>
            <PiArrowLeftBold className="me-1.5 h-4 w-4" />
            {t("Back to Sellers")}
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
        isStaticTitle={!!seller}
      >
        <Link href={routes.sellers.list}>
          <Button variant="outline" className="mt-4 sm:mt-0">
            <PiArrowLeftBold className="me-1.5 h-4 w-4" />
            {t("Back to Sellers")}
          </Button>
        </Link>
      </PageHeader>

      {/* Seller Info Card */}
      <WidgetCard 
        title={t("Seller Information")}
        description={seller.email}
        action={
          <Badge
            variant="flat"
            color={getStatusBadgeColor(seller.accountStatus)}
            className="capitalize"
          >
            {getSellerAccountStatusLabel(seller.accountStatus)}
          </Badge>
        }
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {/* Contact Group */}
          <div className="space-y-4">
            <Title as="h6" className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">{t("Personal Information")}</Title>
             <div>
               <Text className="text-sm text-gray-500">{t("Phone")}</Text>
               <Text className="font-medium text-lg">{seller.phoneNumber}</Text>
             </div>
          </div>

          {/* Financial Group */}
          <div className="space-y-4">
            <Title as="h6" className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">{t("Financial")}</Title>
             <div>
               <Text className="text-sm text-gray-500 flex items-center gap-1"><PiBankBold /> {t("Bank Name")}</Text>
               <Text className="font-medium">{seller.bankName}</Text>
             </div>
             <div>
               <Text className="text-sm text-gray-500">{t("Bank Account")}</Text>
               <Text className="font-medium">{seller.bankAccountNumber}</Text>
             </div>
          </div>

          {/* Statistics/Other Group */}
          <div className="space-y-4">
            <Title as="h6" className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">{t("Statistics")}</Title>
             <div>
               <Text className="text-sm text-gray-500 flex items-center gap-1"><PiMoneyBold /> {t("Total Earnings")}</Text>
               <Text className="font-medium text-green-600 font-bold">{seller.totalEarnings.toFixed(2)} {t("SAR")}</Text>
             </div>
             <div>
               <Text className="text-sm text-gray-500">{t("Commission Rate")}</Text>
               <Text className="font-medium">{seller.commissionRate}%</Text>
             </div>
             <div>
                <Text className="text-sm text-gray-500 flex items-center gap-1"><PiCalendarBlankBold /> {t("Joined")}</Text>
                <Text className="font-medium">
                  {new Date(seller.createdAt).toLocaleDateString()}
                </Text>
             </div>
          </div>
        </div>

        {seller.accountStatus === SellerAccountStatus.PENDING && (
          <div className="mt-8 flex gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
            <Popover placement="top">
              <Popover.Trigger>
                <Button
                  className="flex-1 bg-green-600 text-white hover:bg-black hover:text-white active:bg-green-700"
                  disabled={processingId === "seller"}
                >
                  <PiCheckCircleBold className="me-1.5 h-4 w-4" />
                  {t("Approve Seller")}
                </Button>
              </Popover.Trigger>
              <Popover.Content className="z-[9999] shadow-xl">
                {({ setOpen }) => (
                  <div className="w-56 p-3">
                    <Title as="h6" className="mb-2 text-base font-semibold">{t("Approve Seller")}?</Title>
                    <Text className="mb-4 text-sm text-gray-500">{t("approve-seller-confirm")}</Text>
                    <div className="flex items-center justify-end">
                      <Button 
                        size="sm"
                        className="me-1.5 h-7 bg-green-600 text-white hover:bg-black hover:text-white active:bg-green-700"
                        onClick={() => { 
                          handleApproveSeller(); 
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
                  disabled={processingId === "seller"}
                >
                  <PiXCircleBold className="me-1.5 h-4 w-4" />
                  {t("Reject Seller")}
                </Button>
              </Popover.Trigger>
              <Popover.Content className="z-[9999] shadow-xl">
                {({ setOpen }) => (
                  <div className="w-56 p-3">
                    <Title as="h6" className="mb-2 text-base font-semibold">{t("Reject Seller")}?</Title>
                    <Text className="mb-4 text-sm text-gray-500">{t("reject-seller-confirm")}</Text>
                    <div className="flex items-center justify-end">
                      <Button 
                        size="sm"
                        className="me-1.5 h-7 bg-red-600 text-white hover:bg-black hover:text-white active:bg-red-700"
                        onClick={() => { 
                          handleRejectSeller(); 
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
                title={getSellerDocumentTypeLabel(doc.documentType)}
                statusLabel={getDocumentVerificationStatusLabel(doc.verificationStatus)}
                statusColor={getDocStatusBadgeColor(doc.verificationStatus)}
                documentUrl={doc.documentUrl}
                rejectionReason={doc.rejectionReason}
                onApprove={() => handleApproveSellerDocument(doc.id)}
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
