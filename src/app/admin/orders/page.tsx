import OrdersAdmin from "@/components/admin/OrdersAdmin";
import { listOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  const orders = listOrders(200);
  return <OrdersAdmin initialOrders={orders} />;
}
