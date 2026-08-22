import BannersAdmin from "@/components/admin/BannersAdmin";
import { listAllBanners } from "@/lib/banners";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const banners = await listAllBanners();
  return <BannersAdmin initialBanners={banners} />;
}
