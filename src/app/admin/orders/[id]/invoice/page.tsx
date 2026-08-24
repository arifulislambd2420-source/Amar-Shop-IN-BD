import { notFound } from "next/navigation";
import InvoiceView from "@/components/admin/InvoiceView";
import { getOrderByIdUnsafe, getOrderItems } from "@/lib/orders";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminOrderInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderByIdUnsafe(Number(id));
  if (!order) return notFound();
  const items = await getOrderItems(order.id);
  const logo = (await getSetting("site_logo"))?.trim() || null;

  return <InvoiceView order={order} items={items} logo={logo} />;
}
