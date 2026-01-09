import { metaObject } from "@/config/site.config";
import CreateSupportAgentPage from "@/app/shared/admin/support-agents/create-support-agent-page";

export const metadata = {
  ...metaObject("Create Support Agent"),
};

export default function CreateAgentPage() {
  return <CreateSupportAgentPage />;
}
