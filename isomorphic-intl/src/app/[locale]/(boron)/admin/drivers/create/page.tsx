import { metaObject } from "@/config/site.config";
import CreateDriverPage from "@/app/shared/admin/drivers/create-driver-page";

export const metadata = {
  ...metaObject("Create Driver"),
};

export default function CreateDriverRoute() {
  return <CreateDriverPage />;
}
