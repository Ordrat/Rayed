import { metaObject } from "@/config/site.config";
import SubCategoriesPage from "@/app/shared/admin/shop/sub-categories-page";

export const metadata = {
  ...metaObject("Sub Categories"),
};

export default function SubCategoriesRoute() {
  return <SubCategoriesPage />;
}
