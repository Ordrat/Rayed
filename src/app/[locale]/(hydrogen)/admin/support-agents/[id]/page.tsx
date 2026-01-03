import { metaObject } from "@/config/site.config";
import SupportAgentDetailsPage from "@/app/shared/admin/support-agents/support-agent-details-page";

export const metadata = {
  ...metaObject("Support Agent Details"),
};

export default function AgentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return <SupportAgentDetailsPage agentId={params.id} />;
}
