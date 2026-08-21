import OrdersAdmin from "@/components/admin/OrdersAdmin";
import { listOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listOrders(200);
  return <OrdersAdmin initialOrders={orders} />;
}
