import { metaObject } from "@/config/site.config";
import EditSupportAgentPage from "@/app/shared/admin/support-agents/edit-support-agent-page";

export const metadata = {
  ...metaObject("Edit Support Agent"),
};

export default function EditAgentPage({
  params,
}: {
  params: { id: string };
}) {
  return <EditSupportAgentPage agentId={params.id} />;
}
