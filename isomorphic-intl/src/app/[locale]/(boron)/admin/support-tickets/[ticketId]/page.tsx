import { metaObject } from "@/config/site.config";
import TicketDetailsPage from "@/app/shared/admin/support-tickets/ticket-details-page";

export const metadata = {
  ...metaObject("Ticket Details"),
};

export default function TicketDetailsRoutePage() {
  return <TicketDetailsPage />;
}
