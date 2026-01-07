import { metaObject } from "@/config/site.config";
import ShopCategoriesPage from "@/app/shared/admin/shop/shop-categories-page";

export const metadata = {
  ...metaObject("Shop Categories"),
};

export default function ShopCategoriesRoute() {
  return <ShopCategoriesPage />;
}
