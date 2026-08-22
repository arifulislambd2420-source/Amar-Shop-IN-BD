import FraudApiAdmin from "@/components/admin/FraudApiAdmin";
import { listFraudConfigs } from "@/lib/fraud-config";

export const dynamic = "force-dynamic";

export default async function AdminFraudApiPage() {
  const configs = await listFraudConfigs();
  // Mask the stored api_key before it reaches the client bundle/RSC payload —
  // the raw key must never leave the server (same rule as SMTP's mail_password).
  const masked = configs.map((c) => ({
    ...c,
    api_key: c.api_key ? "********" : "",
  }));
  return <FraudApiAdmin initialConfigs={masked} />;
}
