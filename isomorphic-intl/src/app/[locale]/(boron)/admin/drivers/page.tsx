import { metaObject } from "@/config/site.config";
import DriversPage from "@/app/shared/admin/drivers/drivers-page";

export const metadata = {
  ...metaObject("Drivers Management"),
};

export default function DriversListPage() {
  return <DriversPage />;
}
