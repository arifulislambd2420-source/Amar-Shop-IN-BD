import Link from "next/link";
import { getOrderByToken } from "@/lib/orders";
import { formatTaka } from "@/lib/format";
import { notFound } from "next/navigation";

// Looked up by the unguessable token issued at checkout (not the sequential
// order id) so this URL can't be used to enumerate other customers' orders.
export default async function OrderConfirmationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await getOrderByToken(token);
  if (!result) notFound();
  const { order, items } = result;

  return (
    <div className="container-x py-12 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="h-14 w-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold mb-1">অর্ডার সফল হয়েছে!</h1>
        <p className="text-gray-500">
          আপনার অর্ডার #{order.id} সম্পন্ন হয়েছে। ধন্যবাদ, {order.customer_name}।
        </p>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 mb-4">
        <h2 className="font-semibold mb-3">অর্ডার সামারি</h2>
        <div className="flex flex-col gap-2 mb-3">
          {items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm">
              <span className="text-gray-600">{it.product_name} × {it.quantity}</span>
              <span>{formatTaka(it.line_total)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
          <span>মোট</span>
          <span className="text-brand-orange">{formatTaka(order.total)}</span>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="font-semibold mb-2">বিলিং ঠিকানা</h2>
        <p className="text-sm text-gray-600">
          {order.customer_name}<br />
          {order.address}<br />
          {order.thana}, {order.district} {order.postcode}<br />
          {order.phone}
        </p>
        <div className="text-sm text-gray-600 mt-2 flex items-center flex-wrap gap-2">
          <span>পেমেন্ট: {
            order.payment_method === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 
            order.payment_method === 'advance' ? `অ্যাডভান্স ডেলিভারি চার্জ (${formatTaka(order.advance_amount || 0)})` :
            order.payment_method === 'bkash' ? 'বিকাশ' :
            order.payment_method === 'sslcommerz' ? 'কার্ড / মোবাইল ব্যাংকিং (SSLCommerz)' : 
            order.payment_method
          }</span>
          <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
            order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
            order.payment_status === 'advance_paid' ? 'bg-blue-100 text-blue-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {order.payment_status === 'paid' ? 'সম্পূর্ণ পরিশোধিত' :
             order.payment_status === 'advance_paid' ? 'আংশিক পরিশোধিত' :
             'পরিশোধিত নয়'}
          </span>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Link href="/track" className="border border-brand-orange text-brand-orange font-semibold px-5 py-2.5 rounded-lg">
          অর্ডার ট্র্যাক করুন
        </Link>
        <Link href="/shop" className="bg-brand-orange text-white font-semibold px-5 py-2.5 rounded-lg">
          কেনাকাটা চালিয়ে যান
        </Link>
      </div>
    </div>
  );
}
