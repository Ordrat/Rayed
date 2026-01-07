import { metaObject } from "@/config/site.config";
import SubCategoryFormPage from "@/app/shared/admin/shop/sub-category-form-page";

export const metadata = {
  ...metaObject("Edit Sub Category"),
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSubCategoryRoute({ params }: PageProps) {
  const { id } = await params;
  return <SubCategoryFormPage subCategoryId={id} isEdit={true} />;
}
