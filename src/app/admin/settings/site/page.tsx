import SiteSettingsAdmin from "@/components/admin/SiteSettingsAdmin";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminSiteSettingsPage() {
  const s = await getSettings(["site_logo", "site_name"]);
  return <SiteSettingsAdmin initialLogo={s.site_logo || ""} initialName={s.site_name || ""} />;
}
