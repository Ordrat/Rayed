import { metaObject } from "@/config/site.config";
import SellersPage from "@/app/shared/admin/sellers/sellers-page";

export const metadata = {
  ...metaObject("Sellers Management"),
};

export default function SellersListPage() {
  return <SellersPage />;
}
