import { metaObject } from "@/config/site.config";
import CreateSellerPage from "@/app/shared/admin/sellers/create-seller-page";

export const metadata = {
  ...metaObject("Create Seller"),
};

export default function CreateSellerRoute() {
  return <CreateSellerPage />;
}
