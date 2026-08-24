"use client";

import { useState } from "react";
import Link from "next/link";
import { formatTaka } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "out_for_delivery", "delivered", "completed", "cancelled"];

export default function OrdersAdmin({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);

  async function updateStatus(id: number, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🧾 Orders</h1>
      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 px-4">#</th>
              <th className="py-2 px-4">Customer</th>
              <th className="py-2 px-4">Phone</th>
              <th className="py-2 px-4">District</th>
              <th className="py-2 px-4">Total</th>
              <th className="py-2 px-4">Payment</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-gray-100">
                <td className="py-2 px-4">#{o.id}</td>
                <td className="py-2 px-4">{o.customer_name}</td>
                <td className="py-2 px-4">{o.phone}</td>
                <td className="py-2 px-4">{o.district}</td>
                <td className="py-2 px-4 font-medium">{formatTaka(o.total)}</td>
                <td className="py-2 px-4">
                  <div className="text-xs">
                    <span className="font-semibold uppercase text-gray-700">{o.payment_method === 'cod' ? 'COD' : o.payment_method === 'bkash' ? 'bKash' : o.payment_method === 'sslcommerz' ? 'SSLCommerz' : o.payment_method === 'advance' ? 'Advance' : o.payment_method}</span>
                    <br />
                    <span className={`px-1.5 py-0.5 rounded-full inline-block mt-1 ${o.payment_status === 'paid' ? 'bg-green-100 text-green-700' : o.payment_status === 'advance_paid' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {o.payment_status === 'paid' ? 'Paid' : o.payment_status === 'advance_paid' ? 'Adv. Paid' : 'Unpaid'}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-4">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-4 text-gray-500">{o.created_at}</td>
                <td className="py-2 px-4 whitespace-nowrap">
                  <Link href={`/admin/orders/${o.id}/edit`} className="text-brand-navy hover:underline mr-3">Edit</Link>
                  <Link href={`/admin/orders/${o.id}/invoice`} className="text-brand-navy hover:underline">Invoice</Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={9} className="py-4 text-center text-gray-400">কোনো অর্ডার নেই</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
