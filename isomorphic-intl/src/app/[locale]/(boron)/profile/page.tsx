import { metaObject } from "@/config/site.config";
import ProfileView from "@/app/shared/account-settings/profile-view";

export const metadata = {
  ...metaObject("Profile"),
};

export default function ProfilePage() {
  return <ProfileView />;
}
