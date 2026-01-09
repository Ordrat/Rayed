import { metaObject } from "@/config/site.config";
import SupportDashboard from "@/app/shared/support-dashboard/support-dashboard-page";

export const metadata = {
  ...metaObject("Support Dashboard"),
};

export default function SupportDashboardHomePage() {
  return <SupportDashboard />;
}
