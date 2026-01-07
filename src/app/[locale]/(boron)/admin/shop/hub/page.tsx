import { metaObject } from "@/config/site.config";
import ShopHubPage from "@/app/shared/admin/shop/shop-hub-page";

export const metadata = {
  ...metaObject("Shop Hub"),
};

export default function ShopHubRoute() {
  return <ShopHubPage />;
}
