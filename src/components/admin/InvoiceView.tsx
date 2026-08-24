"use client";

import Link from "next/link";
import { formatTaka } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

// Placeholder company info — update with real business details before going live.
const COMPANY = {
  name: "আমারশপ",
  address: "১২৩ বাণিজ্যিক এলাকা, ঢাকা, বাংলাদেশ",
  phone: "+৮৮০ ১৭০০-০০০০০০",
};

export default function InvoiceView({ order, items, logo }: { order: Order; items: OrderItem[]; logo?: string | null }) {
  const invoiceId = order.invoice_no || order.order_token?.slice(0, 10).toUpperCase() || String(order.id);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-end mb-4 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 rounded bg-brand-navy text-white text-sm"
        >
          Print / Download
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 print:border-0 print:rounded-none print:p-0">
        <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4">
          <div>
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={COMPANY.name} className="h-10 w-auto object-contain" />
            ) : (
              <div className="text-xl font-bold">
                আমার<span className="text-brand-orange">শপ</span>
              </div>
            )}
            <div className="text-2xl font-bold mt-2">INVOICE</div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div>Invoice ID: <span className="font-medium text-gray-900">{invoiceId}</span></div>
            <div>Invoice Date: <span className="font-medium text-gray-900">{order.created_at}</span></div>
            <div>Payment Method: <span className="font-medium text-gray-900 uppercase">{order.payment_method}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div>
            <div className="font-semibold text-gray-700 mb-1">Invoice From</div>
            <div>{COMPANY.name}</div>
            <div>{COMPANY.address}</div>
            <div>{COMPANY.phone}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-1">Invoice To</div>
            <div>{order.customer_name}</div>
            <div>{order.phone}</div>
            <div>{order.address}</div>
            <div>{order.thana}, {order.district}</div>
          </div>
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="text-left border-b border-gray-300">
              <th className="py-2">SL</th>
              <th className="py-2">Product</th>
              <th className="py-2">Price</th>
              <th className="py-2">Qty</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.id} className="border-b border-gray-100">
                <td className="py-2">{i + 1}</td>
                <td className="py-2">{it.product_name}</td>
                <td className="py-2">{formatTaka(it.unit_price)}</td>
                <td className="py-2">{it.quantity}</td>
                <td className="py-2 text-right">{formatTaka(it.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">SubTotal</span>
              <span>{formatTaka(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping (+)</span>
              <span>{formatTaka(order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Discount (−)</span>
              <span>{formatTaka(order.discount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-gray-300 pt-2">
              <span>Total</span>
              <span>{formatTaka(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 print:hidden">
          <Link href="/policy/terms" className="hover:text-brand-orange underline">Terms & Conditions</Link>
        </div>
      </div>
    </div>
  );
}
