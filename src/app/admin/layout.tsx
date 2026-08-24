import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const logo = (await getSetting("site_logo"))?.trim() || null;
  return <AdminLayoutClient logo={logo}>{children}</AdminLayoutClient>;
}
