"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatTaka } from "@/lib/format";
import type { Order, OrderItem, Product } from "@/lib/types";

type LineItem = {
  key: string;
  product_id: number | null;
  product_name: string;
  image: string;
  unit_price: number;
  quantity: number;
  discount: number;
};

let keySeq = 0;
function nextKey() {
  keySeq += 1;
  return `li-${keySeq}`;
}

export default function OrderEditForm({
  order,
  items,
  products,
}: {
  order: Order;
  items: OrderItem[];
  products: Product[];
}) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState(order.customer_name);
  const [phone, setPhone] = useState(order.phone);
  const [address, setAddress] = useState(order.address);
  const [shippingFee, setShippingFee] = useState(order.shipping_fee);
  const [orderDiscount, setOrderDiscount] = useState(order.discount);
  const [paymentMethod, setPaymentMethod] = useState(order.payment_method || "cod");
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status || "unpaid");
  const [lineItems, setLineItems] = useState<LineItem[]>(
    items.map((it) => ({
      key: nextKey(),
      product_id: it.product_id,
      product_name: it.product_name,
      image: products.find((p) => p.id === it.product_id)?.image || "",
      unit_price: it.unit_price,
      quantity: it.quantity,
      discount: it.discount,
    }))
  );
  const [addProductId, setAddProductId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const subtotal = useMemo(
    () => lineItems.reduce((s, li) => s + li.quantity * li.unit_price - li.discount, 0),
    [lineItems]
  );
  const total = subtotal + shippingFee - orderDiscount;

  function addProduct() {
    if (!addProductId) return;
    const product = products.find((p) => p.id === Number(addProductId));
    if (!product) return;
    setLineItems((prev) => [
      ...prev,
      {
        key: nextKey(),
        product_id: product.id,
        product_name: product.name,
        image: product.image,
        unit_price: product.sale_price ?? product.price,
        quantity: 1,
        discount: 0,
      },
    ]);
    setAddProductId("");
  }

  function updateLine(key: string, patch: Partial<LineItem>) {
    setLineItems((prev) => prev.map((li) => (li.key === key ? { ...li, ...patch } : li)));
  }

  function removeLine(key: string) {
    setLineItems((prev) => prev.filter((li) => li.key !== key));
  }

  async function handleSubmit() {
    setError("");
    if (lineItems.length === 0) {
      setError("অন্তত একটি পণ্য থাকতে হবে");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          phone,
          address,
          shipping_fee: shippingFee,
          discount: orderDiscount,
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          items: lineItems.map((li) => ({
            product_id: li.product_id,
            product_name: li.product_name,
            unit_price: li.unit_price,
            quantity: li.quantity,
            discount: li.discount,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Update failed");
        setSaving(false);
        return;
      }
      router.push("/admin/orders");
      router.refresh();
    } catch {
      setError("Update failed");
      setSaving(false);
    }
  }

  const [sendingToCourier, setSendingToCourier] = useState(false);

  async function handleSendToSteadfast() {
    if (!confirm("আপনি কি নিশ্চিত যে এই অর্ডারটি Steadfast Courier এ পাঠাতে চান?")) return;
    setSendingToCourier(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/steadfast`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send to Steadfast");
        return;
      }
      alert(`Successfully sent! Tracking Code: ${data.tracking_code}`);
      router.refresh();
    } catch {
      setError("Network error while sending to Steadfast");
    } finally {
      setSendingToCourier(false);
    }
  }

  async function handleSendToPathao() {
    if (!confirm("আপনি কি নিশ্চিত যে এই অর্ডারটি Pathao Courier এ পাঠাতে চান?")) return;
    setSendingToCourier(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/pathao`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send to Pathao");
        return;
      }
      alert(`Successfully sent! Tracking Code: ${data.tracking_code}`);
      router.refresh();
    } catch {
      setError("Network error while sending to Pathao");
    } finally {
      setSendingToCourier(false);
    }
  }

  async function handleSendToRedX() {
    if (!confirm("আপনি কি নিশ্চিত যে এই অর্ডারটি RedX Courier এ পাঠাতে চান?")) return;
    setSendingToCourier(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/redx`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send to RedX");
        return;
      }
      alert(`Successfully sent! Tracking Code: ${data.tracking_code}`);
      router.refresh();
    } catch {
      setError("Network error while sending to RedX");
    } finally {
      setSendingToCourier(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold">অর্ডার এডিট #{order.id}</h1>
        {!order.consignment_id && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSendToSteadfast}
              disabled={sendingToCourier}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-60"
            >
              {sendingToCourier ? "Sending..." : "🚀 Steadfast"}
            </button>
            <button
              type="button"
              onClick={handleSendToPathao}
              disabled={sendingToCourier}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-60"
            >
              {sendingToCourier ? "Sending..." : "🚀 Pathao"}
            </button>
            <button
              type="button"
              onClick={handleSendToRedX}
              disabled={sendingToCourier}
              className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-60"
            >
              {sendingToCourier ? "Sending..." : "🚀 RedX"}
            </button>
          </div>
        )}
        <a
          href={`/admin/orders/${order.id}/invoice`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2"
        >
          📄 Print Invoice
        </a>
        {order.consignment_id && (
          <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-sm font-medium">
            Courier ID: {order.consignment_id} ({order.courier_status})
          </span>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <label className="block text-sm text-gray-600 mb-1">আরও একটি পণ্য যোগ করুন</label>
        <div className="flex gap-2">
          <select
            value={addProductId}
            onChange={(e) => setAddProductId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm flex-1"
          >
            <option value="">-- পণ্য নির্বাচন করুন --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {formatTaka(p.sale_price ?? p.price)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addProduct}
            className="px-4 py-2 rounded bg-brand-navy text-white text-sm"
          >
            যোগ করুন
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 px-4">Image</th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Quantity</th>
              <th className="py-2 px-4">Sell Price</th>
              <th className="py-2 px-4">Discount</th>
              <th className="py-2 px-4">Sub Total</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((li) => {
              const lineSubtotal = li.quantity * li.unit_price - li.discount;
              return (
                <tr key={li.key} className="border-b border-gray-100">
                  <td className="py-2 px-4">
                    {li.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={li.image} alt={li.product_name} className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded" />
                    )}
                  </td>
                  <td className="py-2 px-4">{li.product_name}</td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateLine(li.key, { quantity: Math.max(1, li.quantity - 1) })}
                        className="w-6 h-6 border border-gray-300 rounded"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={li.quantity}
                        onChange={(e) => updateLine(li.key, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                        className="w-14 border border-gray-300 rounded px-1 py-1 text-center"
                      />
                      <button
                        type="button"
                        onClick={() => updateLine(li.key, { quantity: li.quantity + 1 })}
                        className="w-6 h-6 border border-gray-300 rounded"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      min={0}
                      value={li.unit_price}
                      onChange={(e) => updateLine(li.key, { unit_price: Number(e.target.value) || 0 })}
                      className="w-24 border border-gray-300 rounded px-2 py-1"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      min={0}
                      value={li.discount}
                      onChange={(e) => updateLine(li.key, { discount: Number(e.target.value) || 0 })}
                      className="w-24 border border-gray-300 rounded px-2 py-1"
                    />
                  </td>
                  <td className="py-2 px-4 font-medium">{formatTaka(lineSubtotal)}</td>
                  <td className="py-2 px-4">
                    <button
                      type="button"
                      onClick={() => removeLine(li.key)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
            {lineItems.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-center text-gray-400">কোনো পণ্য নেই</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <h2 className="font-semibold mb-2">কাস্টমার তথ্য</h2>
          <div>
            <label className="block text-sm text-gray-600 mb-1">নাম</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">ফোন</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">ঠিকানা</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <h2 className="font-semibold mb-2">পেমেন্ট তথ্য</h2>
          <div>
            <label className="block text-sm text-gray-600 mb-1">পেমেন্ট পদ্ধতি</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="advance">Advance Delivery Charge</option>
              <option value="bkash">bKash</option>
              <option value="sslcommerz">SSLCommerz (Card/Bank)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">পেমেন্ট স্ট্যাটাস</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="unpaid">Unpaid</option>
              <option value="advance_paid">Advance Paid</option>
              <option value="paid">Paid (Full)</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <h2 className="font-semibold mb-2">সারসংক্ষেপ</h2>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sub Total</span>
            <span className="font-medium">{formatTaka(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Shipping Fee</span>
            <input
              type="number"
              min={0}
              value={shippingFee}
              onChange={(e) => setShippingFee(Number(e.target.value) || 0)}
              className="w-28 border border-gray-300 rounded px-2 py-1 text-right"
            />
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Discount</span>
            <input
              type="number"
              min={0}
              value={orderDiscount}
              onChange={(e) => setOrderDiscount(Number(e.target.value) || 0)}
              className="w-28 border border-gray-300 rounded px-2 py-1 text-right"
            />
          </div>
          <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
            <span>Total</span>
            <span>{formatTaka(total)}</span>
          </div>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving}
        className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-60"
      >
        {saving ? "সংরক্ষণ হচ্ছে..." : "Update Order"}
      </button>
    </div>
  );
}
