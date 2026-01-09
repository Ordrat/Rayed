import { metaObject } from "@/config/site.config";
import SubCategoryFormPage from "@/app/shared/admin/shop/sub-category-form-page";

export const metadata = {
  ...metaObject("Create Sub Category"),
};

export default function CreateSubCategoryRoute() {
  return <SubCategoryFormPage isEdit={false} />;
}
