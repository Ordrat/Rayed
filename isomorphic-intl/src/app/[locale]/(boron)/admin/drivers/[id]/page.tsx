import { metaObject } from "@/config/site.config";
import DriverDetailsPage from "@/app/shared/admin/drivers/driver-details-page";

export const metadata = {
  ...metaObject("Driver Details"),
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DriverDetailsRoute({ params }: PageProps) {
  const { id } = await params;
  return <DriverDetailsPage driverId={id} />;
}
