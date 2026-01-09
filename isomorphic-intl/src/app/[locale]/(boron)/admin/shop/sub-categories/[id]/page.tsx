import { metaObject } from "@/config/site.config";
import SubCategoryDetailsPage from "@/app/shared/admin/shop/sub-category-details-page";

export const metadata = {
  ...metaObject("Sub Category Details"),
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SubCategoryDetailsRoute({ params }: PageProps) {
  const { id } = await params;
  return <SubCategoryDetailsPage subCategoryId={id} />;
}
