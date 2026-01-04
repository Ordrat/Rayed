import { metaObject } from "@/config/site.config";
import SupportAgentDetailsPage from "@/app/shared/admin/support-agents/support-agent-details-page";

export const metadata = {
  ...metaObject("Support Agent Details"),
};

export default async function AgentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SupportAgentDetailsPage agentId={id} />;
}
