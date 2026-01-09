import { metaObject } from "@/config/site.config";
import ProductDetailsPage from "@/app/shared/admin/products/product-details-page";

export const metadata = {
  ...metaObject("Product Details"),
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailsRoute({ params }: PageProps) {
  const { id } = await params;
  return <ProductDetailsPage productId={id} />;
}
