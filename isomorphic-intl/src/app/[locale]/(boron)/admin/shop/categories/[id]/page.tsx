import { metaObject } from "@/config/site.config";
import ShopCategoryDetailsPage from "@/app/shared/admin/shop/shop-category-details-page";

export const metadata = {
  ...metaObject("Shop Category Details"),
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryDetailsRoute({ params }: PageProps) {
  const { id } = await params;
  return <ShopCategoryDetailsPage categoryId={id} />;
}
