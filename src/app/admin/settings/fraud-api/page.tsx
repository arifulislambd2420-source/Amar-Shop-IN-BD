import FraudApiAdmin from "@/components/admin/FraudApiAdmin";
import { listFraudConfigs } from "@/lib/fraud-config";

export const dynamic = "force-dynamic";

export default async function AdminFraudApiPage() {
  const configs = await listFraudConfigs();
  return <FraudApiAdmin initialConfigs={configs} />;
}
