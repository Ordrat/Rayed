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
import { useRouter } from "@/i18n/routing";

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
  const [seller, setSeller] = useState<Seller | null>(null);
  const [documents, setDocuments] = useState<SellerDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pageHeader = {
    title: seller ? `${seller.firstName} ${seller.lastName}` : "Seller Details",
    breadcrumb: [
      { name: "Home", href: "/" },
      { name: "Admin", href: "#" },
      { name: "Sellers", href: routes.sellers.list },
      { name: "Details" },
    ],
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchSellerDetails();
    } else if (status === "unauthenticated") {
      router.push(routes.auth.signIn);
    }
  }, [session, status, sellerId]);

  const fetchSellerDetails = async () => {
    try {
      setIsLoading(true);
      const [sellerData, docsData] = await Promise.all([
        getSellerById(sellerId, session?.accessToken || ""),
        getSellerDocuments(sellerId, session?.accessToken || ""),
      ]);
      setSeller(sellerData);
      setDocuments(docsData);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch seller details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveSeller = async () => {
    if (!seller) return;
    setProcessingId("seller");
    try {
      await changeSellerAccountStatus(
        { sellerId: seller.id, accountStatus: SellerAccountStatus.APPROVED },
        session?.accessToken || ""
      );
      setSeller({ ...seller, accountStatus: SellerAccountStatus.APPROVED });
      toast.success("Seller approved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve seller");
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
      toast.success("Seller rejected");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject seller");
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveDocument = async (docId: string) => {
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
      await changeSellerDocumentStatus(
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

  if (!seller) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center">
        <Text className="mb-4 text-gray-500">Seller not found</Text>
        <Link href={routes.sellers.list}>
          <Button>
            <PiArrowLeftBold className="me-1.5 h-4 w-4" />
            Back to Sellers
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
            Back to Sellers
          </Button>
        </Link>
      </PageHeader>

      {/* Seller Info Card */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <Title as="h3" className="mb-2 text-xl font-semibold">
              Seller Information
            </Title>
            <Text className="text-gray-500">{seller.email}</Text>
          </div>
          <Badge
            variant="flat"
            color={getStatusBadgeColor(seller.accountStatus)}
            className="capitalize"
          >
            {getSellerAccountStatusLabel(seller.accountStatus)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Text className="text-sm text-gray-500">Phone</Text>
            <Text className="font-medium">{seller.phoneNumber}</Text>
          </div>
          <div>
            <Text className="text-sm text-gray-500">Bank Name</Text>
            <Text className="font-medium">{seller.bankName}</Text>
          </div>
          <div>
            <Text className="text-sm text-gray-500">Bank Account</Text>
            <Text className="font-medium">{seller.bankAccountNumber}</Text>
          </div>
          <div>
            <Text className="text-sm text-gray-500">Total Earnings</Text>
            <Text className="font-medium">{seller.totalEarnings.toFixed(2)} SAR</Text>
          </div>
          <div>
            <Text className="text-sm text-gray-500">Commission Rate</Text>
            <Text className="font-medium">{seller.commissionRate}%</Text>
          </div>
          <div>
            <Text className="text-sm text-gray-500">Joined</Text>
            <Text className="font-medium">
              {new Date(seller.createdAt).toLocaleDateString()}
            </Text>
          </div>
        </div>

        {seller.accountStatus === SellerAccountStatus.PENDING && (
          <div className="mt-6 flex gap-4">
            <Button
              className="bg-green-600 text-white hover:bg-black hover:text-white active:bg-green-700"
              onClick={handleApproveSeller}
              disabled={processingId === "seller"}
            >
              <PiCheckCircleBold className="me-1.5 h-4 w-4" />
              Approve Seller
            </Button>
            <Button
              variant="outline"
              className="bg-red-600 text-white hover:bg-black hover:text-white hover:border-black active:bg-red-700 border-transparent"
              onClick={handleRejectSeller}
              disabled={processingId === "seller"}
            >
              <PiXCircleBold className="me-1.5 h-4 w-4" />
              Reject Seller
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-600"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <PiFileBold className="h-5 w-5 text-gray-500" />
                    <Text className="font-medium">
                      {getSellerDocumentTypeLabel(doc.documentType)}
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
