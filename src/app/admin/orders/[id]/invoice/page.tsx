import { notFound } from "next/navigation";
import InvoiceView from "@/components/admin/InvoiceView";
import { getOrderByIdUnsafe, getOrderItems } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminOrderInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderByIdUnsafe(Number(id));
  if (!order) return notFound();
  const items = await getOrderItems(order.id);

  return <InvoiceView order={order} items={items} />;
}
