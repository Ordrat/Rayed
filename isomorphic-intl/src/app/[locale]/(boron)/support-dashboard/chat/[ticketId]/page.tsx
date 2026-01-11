import { metaObject } from "@/config/site.config";
import SupportChatPage from "@/app/shared/support-dashboard/support-chat-page";

export const metadata = {
  ...metaObject("Support Chat"),
};

export default function ChatRoutePage() {
  return <SupportChatPage />;
}
