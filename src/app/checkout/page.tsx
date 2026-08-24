"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { formatTaka, SHIPPING_FEE } from "@/lib/format";
import { BD_DISTRICTS } from "@/lib/districts";
import { pushToDataLayer } from "@/lib/gtm-client";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_amount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  useEffect(() => {
    if (mounted && items.length > 0) {
      pushToDataLayer("begin_checkout", {
        ecommerce: {
          currency: "BDT",
          value: subtotal(),
          items: items.map((i) => ({
            item_id: i.productId,
            item_name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        },
      });
    }
    // fire once when the page becomes ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "advance" | "bkash" | "sslcommerz">("cod");

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    district: "",
    thana: "",
    postcode: "",
    address: "",
    notes: "",
  });

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container-x py-16 text-center">
        <p className="text-gray-500 mb-4">আপনার কার্টটি এখন খালি — checkout করার আগে পণ্য যোগ করুন।</p>
        <Link href="/shop" className="text-brand-orange font-semibold">শপিং শুরু করুন →</Link>
      </div>
    );
  }

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleApplyCoupon() {
    setCouponError("");
    setCouponSuccess("");
    if (!couponCode) return;

    try {
      const res = await fetch("/api/cart/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartSubtotal: subtotal() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "কুপন যাচাই করা যায়নি");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data);
        setCouponSuccess("কুপন সফলভাবে প্রয়োগ করা হয়েছে!");
      }
    } catch {
      setCouponError("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload: any = {
        ...form,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, variantId: i.variantId })),
      };
      if (appliedCoupon) {
        payload.couponCode = appliedCoupon.code;
      }
      
      payload.payment_method = paymentMethod;
      if (paymentMethod === "advance") {
        payload.advance_amount = SHIPPING_FEE;
        payload.payment_status = "unpaid"; // will be updated when payment is successful
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "অর্ডার সম্পন্ন করা যায়নি");
        setSubmitting(false);
        return;
      }
      const totalCost = Math.max(0, subtotal() + SHIPPING_FEE - (appliedCoupon?.discount_amount || 0));

      pushToDataLayer("purchase", {
        ecommerce: {
          transaction_id: data.orderToken,
          value: totalCost,
          currency: "BDT",
          shipping: SHIPPING_FEE,
          coupon: appliedCoupon?.code || undefined,
          items: items.map(i => ({
            item_id: i.productId,
            item_name: i.name,
            price: i.price,
            quantity: i.quantity
          }))
        }
      });

      clear();
      
      // Handle mock redirection for payment gateways
      if (paymentMethod === "bkash" || paymentMethod === "sslcommerz" || paymentMethod === "advance") {
        router.push(`/checkout/pay?token=${data.orderToken}&method=${paymentMethod}`);
      } else {
        router.push(`/order/${data.orderToken}`);
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন");
      setSubmitting(false);
    }
  }

  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold mb-6">বিলিং তথ্য</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="md:col-span-2 flex flex-col gap-4">
          <Field label="পূর্ণ নাম" required>
            <input
              required
              value={form.customer_name}
              onChange={(e) => update("customer_name", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="ফোন নম্বর" required>
            <input
              required
              type="tel"
              pattern="0?1[0-9]{9,10}"
              placeholder="01XXXXXXXXX"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="ইমেইল (ঐচ্ছিক)">
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="জেলা" required>
              <select
                required
                value={form.district}
                onChange={(e) => update("district", e.target.value)}
                className="input"
              >
                <option value="">নির্বাচন করুন</option>
                {BD_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="থানা" required>
              <input
                required
                value={form.thana}
                onChange={(e) => update("thana", e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <Field label="পোস্ট কোড (ঐচ্ছিক)">
            <input
              value={form.postcode}
              onChange={(e) => update("postcode", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="বিস্তারিত ঠিকানা" required>
            <textarea
              required
              rows={3}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="অর্ডার নোট (ঐচ্ছিক)">
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className="input"
            />
          </Field>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="font-medium mb-3">পেমেন্ট পদ্ধতি</div>
            <div className="flex flex-col gap-3">
              <label className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-brand-orange bg-brand-orange/5' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="payment" className="mt-1" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <div>
                  <div className="font-medium">ক্যাশ অন ডেলিভারি (Cash on Delivery)</div>
                  <div className="text-xs text-gray-500">পণ্য হাতে পেয়ে ডেলিভারি ম্যানকে পেমেন্ট করুন</div>
                </div>
              </label>
              
              <label className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${paymentMethod === 'advance' ? 'border-brand-orange bg-brand-orange/5' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="payment" className="mt-1" checked={paymentMethod === 'advance'} onChange={() => setPaymentMethod('advance')} />
                <div>
                  <div className="font-medium">অ্যাডভান্স ডেলিভারি চার্জ ({formatTaka(SHIPPING_FEE)})</div>
                  <div className="text-xs text-gray-500">বিকাশ বা নগদের মাধ্যমে শুধুমাত্র ডেলিভারি চার্জ আগে পরিশোধ করুন, বাকি টাকা ক্যাশ অন ডেলিভারি</div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${paymentMethod === 'bkash' ? 'border-brand-orange bg-brand-orange/5' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="payment" className="mt-1" checked={paymentMethod === 'bkash'} onChange={() => setPaymentMethod('bkash')} />
                <div>
                  <div className="font-medium">বিকাশ (bKash) - ফুল পেমেন্ট</div>
                  <div className="text-xs text-gray-500">বিকাশের মাধ্যমে সম্পূর্ণ বিল অনলাইনে পরিশোধ করুন</div>
                </div>
              </label>
              
              <label className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${paymentMethod === 'sslcommerz' ? 'border-brand-orange bg-brand-orange/5' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="payment" className="mt-1" checked={paymentMethod === 'sslcommerz'} onChange={() => setPaymentMethod('sslcommerz')} />
                <div>
                  <div className="font-medium">কার্ড / মোবাইল ব্যাংকিং (SSLCommerz)</div>
                  <div className="text-xs text-gray-500">ভিসা, মাস্টারকার্ড বা অন্যান্য মোবাইল ব্যাংকিং দিয়ে পে করুন</div>
                </div>
              </label>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="font-medium mb-2">কুপন কোড (ঐচ্ছিক)</div>
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="কুপন কোড দিন"
                className="input flex-1"
                disabled={!!appliedCoupon}
              />
              {!appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-gray-800 text-white px-4 rounded-lg text-sm font-medium hover:bg-gray-700"
                >
                  প্রয়োগ করুন
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setAppliedCoupon(null); setCouponCode(""); setCouponSuccess(""); }}
                  className="bg-red-500 text-white px-4 rounded-lg text-sm font-medium hover:bg-red-600"
                >
                  বাতিল
                </button>
              )}
            </div>
            {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
            {couponSuccess && <p className="text-green-600 text-sm mt-2">{couponSuccess}</p>}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-60 text-white font-semibold py-3 rounded-lg"
          >
            {submitting ? "অর্ডার হচ্ছে..." : "অর্ডার করুন"}
          </button>
        </form>

        <div className="border border-gray-200 rounded-xl p-5 h-fit">
          <div className="font-semibold mb-3">অর্ডার সামারি</div>
          <div className="flex flex-col gap-2 mb-3 max-h-64 overflow-y-auto">
            {items.map((i) => (
              <div key={i.productId} className="flex justify-between text-sm">
                <span className="text-gray-600">{i.name} × {i.quantity}</span>
                <span>{formatTaka(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">সাবটোটাল</span>
            <span className="font-semibold">{formatTaka(subtotal())}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">ডেলিভারি চার্জ</span>
            <span className="font-semibold">{formatTaka(SHIPPING_FEE)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">ডিসকাউন্ট</span>
            <span className="font-semibold text-green-600">-{formatTaka(appliedCoupon?.discount_amount || 0)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
            <span>মোট</span>
            <span className="text-brand-orange">{formatTaka(Math.max(0, subtotal() + SHIPPING_FEE - (appliedCoupon?.discount_amount || 0)))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-gray-700">
        {label} {required && <span className="text-brand-orange">*</span>}
      </span>
      {children}
    </label>
  );
}
