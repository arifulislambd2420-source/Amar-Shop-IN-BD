import { notFound } from "next/navigation";
import OrderEditForm from "@/components/admin/OrderEditForm";
import { getOrderByIdUnsafe, getOrderItems } from "@/lib/orders";
import { listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminOrderEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderByIdUnsafe(Number(id));
  if (!order) return notFound();
  const items = await getOrderItems(order.id);
  const products = await listProducts({ onlyActive: true });

  return <OrderEditForm order={order} items={items} products={products} />;
}
