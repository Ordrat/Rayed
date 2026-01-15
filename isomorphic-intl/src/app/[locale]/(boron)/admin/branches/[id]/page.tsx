import { metaObject } from "@/config/site.config";
import BranchDetailsPage from "@/app/shared/admin/branches/branch-details-page";

export const metadata = {
  ...metaObject("Branch Details"),
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BranchDetailsRoutePage({ params }: PageProps) {
  const { id } = await params;
  return <BranchDetailsPage branchId={id} />;
}
