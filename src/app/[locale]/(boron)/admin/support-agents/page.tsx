import { metaObject } from "@/config/site.config";
import SupportAgentsPage from "@/app/shared/admin/support-agents/support-agents-page";

export const metadata = {
  ...metaObject("Support Agents Management"),
};

export default function SupportAgentsListPage() {
  return <SupportAgentsPage />;
}
