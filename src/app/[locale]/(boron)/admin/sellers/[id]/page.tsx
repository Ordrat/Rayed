import { metaObject } from "@/config/site.config";
import SellerDetailsPage from "@/app/shared/admin/sellers/seller-details-page";

export const metadata = {
  ...metaObject("Seller Details"),
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SellerDetailsRoute({ params }: PageProps) {
  const { id } = await params;
  return <SellerDetailsPage sellerId={id} />;
}
