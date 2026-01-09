import { metaObject } from "@/config/site.config";
import ShopCategoryFormPage from "@/app/shared/admin/shop/shop-category-form-page";

export const metadata = {
  ...metaObject("Create Shop Category"),
};

export default function CreateCategoryRoute() {
  return <ShopCategoryFormPage isEdit={false} />;
}
