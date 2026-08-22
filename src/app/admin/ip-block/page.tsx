import IpBlockAdmin from "@/components/admin/IpBlockAdmin";
import { listIpBlocks } from "@/lib/ip-block";

export const dynamic = "force-dynamic";

export default async function AdminIpBlockPage() {
  const blocks = await listIpBlocks();
  return <IpBlockAdmin initialBlocks={blocks} />;
}
