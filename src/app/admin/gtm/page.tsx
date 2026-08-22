import GtmAdmin from "@/components/admin/GtmAdmin";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminGtmPage() {
  const gtmId = (await getSetting("gtm_id")) || "";
  return <GtmAdmin initialGtmId={gtmId} />;
}
