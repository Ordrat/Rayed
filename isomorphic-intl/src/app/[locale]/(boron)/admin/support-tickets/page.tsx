import { metaObject } from "@/config/site.config";
import SupportTicketsPage from "@/app/shared/admin/support-tickets/support-tickets-page";

export const metadata = {
  ...metaObject("Support Tickets Management"),
};

export default function SupportTicketsListPage() {
  return <SupportTicketsPage />;
}
