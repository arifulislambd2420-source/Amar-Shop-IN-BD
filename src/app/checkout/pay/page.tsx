"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { formatTaka, SHIPPING_FEE } from "@/lib/format";
import Link from "next/link";

export default function PaymentGatewayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const method = searchParams.get("method");
  
  const [status, setStatus] = useState<"initializing" | "processing" | "success" | "error">("initializing");
  
  useEffect(() => {
    if (!token || !method) {
      setStatus("error");
      return;
    }

    // Simulate gateway initialization
    const timer1 = setTimeout(() => {
      setStatus("processing");
    }, 1500);

    return () => clearTimeout(timer1);
  }, [token, method]);

  const handleSimulatePayment = async () => {
    try {
      setStatus("processing");
      
      // Call our API to update the payment status
      const res = await fetch("/api/orders/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderToken: token,
          method: method,
          status: "paid"
        })
      });

      if (!res.ok) throw new Error("Payment update failed");

      setStatus("success");
      
      // Redirect to order confirmation page after success
      setTimeout(() => {
        router.push(`/order/${token}`);
      }, 2000);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const getGatewayName = () => {
    if (method === "bkash") return "bKash Payment Gateway";
    if (method === "sslcommerz") return "SSLCommerz Secure Checkout";
    if (method === "advance") return "Advance Delivery Charge Payment";
    return "Secure Payment Gateway";
  };

  const getPaymentAmountText = () => {
    if (method === "advance") return `অ্যাডভান্স পে করুন: ${formatTaka(SHIPPING_FEE)}`;
    return "সম্পূর্ণ বিল পে করুন";
  };

  if (status === "error") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">পেমেন্ট ত্রুটি</h1>
        <p className="text-gray-500 mb-6">কোনো একটি সমস্যা হয়েছে অথবা পেমেন্ট বাতিল করা হয়েছে।</p>
        <Link href={`/order/${token}`} className="px-6 py-2 bg-brand-orange text-white rounded-lg font-medium">
          অর্ডারে ফিরে যান
        </Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold mb-2">পেমেন্ট সফল!</h1>
        <p className="text-gray-500 mb-6">আপনার পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।</p>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>অর্ডার পেজে ফিরে যাওয়া হচ্ছে...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-full mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold">{getGatewayName()}</h1>
        <p className="text-sm text-gray-500 mt-1">Mock Integration - {getPaymentAmountText()}</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg text-sm text-center text-gray-600">
          এটি একটি ডামি পেমেন্ট পেজ। আসল ওয়েবসাইটে এখানে {method === "bkash" ? "বিকাশ" : method === "sslcommerz" ? "SSLCommerz" : "পেমেন্ট গেটওয়ে"} এর আসল পেজ দেখাবে।
        </div>
        
        <button
          onClick={handleSimulatePayment}
          disabled={status !== "processing"}
          className={`w-full py-3 rounded-lg font-medium text-white transition-colors flex justify-center items-center gap-2 ${
            status === "processing" 
              ? method === "bkash" ? "bg-[#e2136e] hover:bg-[#c71060]" : "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {status === "processing" ? (
             <span>পেমেন্ট সম্পন্ন করুন</span>
          ) : (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>অপেক্ষা করুন...</span>
            </>
          )}
        </button>
        
        <div className="text-center">
          <Link href={`/order/${token}`} className="text-sm text-gray-500 hover:text-gray-800 underline">
            পেমেন্ট বাতিল করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
