import { metaObject } from "@/config/site.config";
import BranchesPage from "@/app/shared/admin/branches/branches-page";

export const metadata = {
  ...metaObject("Branches Management"),
};

export default function BranchesListPage() {
  return <BranchesPage />;
}
