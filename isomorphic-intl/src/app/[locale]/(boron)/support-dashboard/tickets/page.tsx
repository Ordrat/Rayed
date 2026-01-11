import { metaObject } from "@/config/site.config";
import MyTicketsPage from "@/app/shared/support-dashboard/my-tickets-page";

export const metadata = {
  ...metaObject("My Tickets"),
};

export default function SupportTicketsRoutePage() {
  return <MyTicketsPage />;
}
