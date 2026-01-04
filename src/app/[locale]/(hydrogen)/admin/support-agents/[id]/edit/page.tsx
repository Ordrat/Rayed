import { metaObject } from "@/config/site.config";
import EditSupportAgentPage from "@/app/shared/admin/support-agents/edit-support-agent-page";

export const metadata = {
  ...metaObject("Edit Support Agent"),
};

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditSupportAgentPage agentId={id} />;
}
