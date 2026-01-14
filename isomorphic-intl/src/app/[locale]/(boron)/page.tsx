import OverviewPage from "@/app/shared/admin/overview";
import { metaObject } from "@/config/site.config";

export const metadata = {
  ...metaObject("Overview"),
};

export default function FileDashboardPage() {
  return <OverviewPage />;
}
