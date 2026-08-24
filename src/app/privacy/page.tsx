import { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "প্রাইভেসি পলিসি (Privacy Policy)",
  description: "আমারশপ — আপনার ব্যক্তিগত তথ্যের নিরাপত্তা ও গোপনীয়তা রক্ষা করা আমাদের দায়িত্ব।",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-x py-10 max-w-4xl">
      <nav className="text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-orange">হোম</Link> &gt; <span>প্রাইভেসি পলিসি</span>
      </nav>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-10 shadow-xs space-y-6 text-gray-700 leading-relaxed">
        <h1 className="text-3xl font-bold text-gray-900 border-b border-gray-100 pb-4">
          প্রাইভেসি পলিসি (Privacy Policy)
        </h1>

        <p className="text-gray-600">
          <strong className="text-gray-900">{SITE_CONFIG.legalName}</strong> গ্রাহকদের ব্যক্তিগত তথ্যের সর্বোচ্চ সুরক্ষা ও গোপনীয়তা নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ। আমাদের ওয়েবসাইট ব্যবহারের মাধ্যমে আপনি আমাদের গোপনীয়তা নীতি মেনে নিচ্ছেন।
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">১. আমরা কী কী তথ্য সংগ্রহ করি</h2>
          <ul className="list-disc list-inside space-y-1 text-sm pl-2">
            <li>অর্ডার সম্পন্ন করার জন্য আপনার নাম, মোবাইল নম্বর, ডেলিভারির সম্পূর্ণ ঠিকানা।</li>
            <li>কাস্টমার একাউন্ট বা সাপোর্টের জন্য প্রয়োজনীয় ইমেইল ঠিকানা।</li>
            <li>ওয়েবসাইটের পারফরম্যান্স ও অভিজ্ঞতা বৃদ্ধির জন্য স্ট্যান্ডার্ড ব্রাউজিং ডেটা ও কুকিজ।</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">২. তথ্যের ব্যবহার</h2>
          <p className="text-sm">
            সংগৃহীত তথ্য শুধুমাত্র পণ্য ডেলিভারি, অর্ডারের স্ট্যাটাস আপডেট জানানো, কাস্টমার সাপোর্ট প্রদান এবং আমাদের সেবার মান উন্নত করার কাজে ব্যবহার করা হয়।
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">৩. তথ্যের নিরাপত্তা</h2>
          <p className="text-sm">
            আমরা গ্রাহকদের কোনো ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষ বা মার্কেটিং এজেন্সির কাছে বিক্রি বা প্রকাশ করি না। শুধুমাত্র ডেলিভারি সম্পন্ন করার স্বার্থে কুরিয়ার সার্ভিসের সাথে প্রয়োজনীয় তথ্য (নাম, ঠিকানা ও ফোন নম্বর) শেয়ার করা হয়।
          </p>
        </section>

        <section className="space-y-3 border-t border-gray-100 pt-4">
          <h2 className="text-xl font-bold text-gray-900">যোগাযোগ</h2>
          <p className="text-sm">
            প্রাইভেসি পলিসি নিয়ে কোনো প্রশ্ন থাকলে ইমেইল করুন:{" "}
            <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="text-brand-orange">
              {SITE_CONFIG.supportEmail}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
