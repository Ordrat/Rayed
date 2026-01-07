import { metaObject } from "@/config/site.config";
import ShopCategoryFormPage from "@/app/shared/admin/shop/shop-category-form-page";

export const metadata = {
  ...metaObject("Edit Shop Category"),
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryRoute({ params }: PageProps) {
  const { id } = await params;
  return <ShopCategoryFormPage categoryId={id} isEdit={true} />;
}
