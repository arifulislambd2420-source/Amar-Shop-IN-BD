import { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে (About Us)",
  description: "আমারশপ — ১০০% খাঁটি, প্রাকৃতিক ও স্বাস্থ্যসম্মত খাদ্যপণ্য আপনার ঘরে পৌঁছে দিতে আমরা প্রতিশ্রুতিবদ্ধ।",
};

export default function AboutPage() {
  return (
    <div className="container-x py-10 max-w-4xl">
      <nav className="text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-orange">হোম</Link> &gt; <span>আমাদের সম্পর্কে</span>
      </nav>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-10 shadow-xs space-y-6 text-gray-700 leading-relaxed">
        <h1 className="text-3xl font-bold text-gray-900 border-b border-gray-100 pb-4">
          আমাদের সম্পর্কে — <span className="text-brand-orange">{SITE_CONFIG.name}</span>
        </h1>

        <p className="text-lg text-gray-600 font-medium">
          স্বাগতম <strong className="text-gray-900">{SITE_CONFIG.legalName}</strong>-এ! আমরা দেশের প্রতিটি প্রান্তে ১০০% খাঁটি, ভেজালমুক্ত এবং প্রাকৃতিক খাদ্যপণ্য পৌঁছে দেওয়ার প্রত্যয় নিয়ে কাজ করছি।
        </p>

        <div className="grid sm:grid-cols-3 gap-4 my-8">
          <div className="bg-orange-50/60 border border-orange-100 p-4 rounded-xl text-center">
            <div className="text-2xl mb-1">🌿</div>
            <h3 className="font-bold text-gray-900 mb-1">১০০% প্রাকৃতিক</h3>
            <p className="text-xs text-gray-600">কোনো প্রকার ক্ষতিকর কেমিক্যাল বা প্রিজারভেটিভ ছাড়া খাঁটি পণ্য।</p>
          </div>
          <div className="bg-orange-50/60 border border-orange-100 p-4 rounded-xl text-center">
            <div className="text-2xl mb-1">🚚</div>
            <h3 className="font-bold text-gray-900 mb-1">দ্রুত হোম ডেলিভারি</h3>
            <p className="text-xs text-gray-600">সারাদেশে বিশ্বস্ত কুরিয়ার পার্টনারের মাধ্যমে ক্যাশ অন ডেলিভারি।</p>
          </div>
          <div className="bg-orange-50/60 border border-orange-100 p-4 rounded-xl text-center">
            <div className="text-2xl mb-1">🤝</div>
            <h3 className="font-bold text-gray-900 mb-1">নির্ভরযোগ্য সেবা</h3>
            <p className="text-xs text-gray-600">পণ্য দেখে নেওয়ার সুযোগ ও দ্রুত গ্রাহক সেবা প্রদান।</p>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">আমাদের লক্ষ্য ও উদ্দেশ্য</h2>
          <p>
            আমাদের প্রধান লক্ষ্য হলো আধুনিক নাগরিক জীবনের ভেজালের ভিড়ে পরিবারগুলোর কাছে পুষ্টিকর, অর্গানিক ও নিরাপদ খাবারের জোগান নিশ্চিত করা। সুন্দরবনের প্রাকৃতিক চাকের খাঁটি মধু, ঘানিভাঙা খাঁটি সরিষার তেল, দেশি গাভীর গাওয়া ঘি, প্রিমিয়াম কোয়ালিটি বাদাম ও খেজুর সরাসরি উৎস থেকে সংগ্রহ করে কঠোর মান নিয়ন্ত্রণের মাধ্যমে গ্রাহকদের কাছে সরবরাহ করা হয়।
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">যোগাযোগের ঠিকানা</h2>
          <p>
            আমাদের পণ্য বা সেবা সম্পর্কে যেকোনো তথ্য বা মতামতের জন্য সরাসরি যোগাযোগ করতে পারেন:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 text-gray-600 pl-2">
            <li><strong>হেল্পলাইন:</strong> <a href={`tel:${SITE_CONFIG.supportPhoneRaw}`} className="text-brand-orange">{SITE_CONFIG.supportPhone}</a></li>
            <li><strong>ইমেইল:</strong> <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="text-brand-orange">{SITE_CONFIG.supportEmail}</a></li>
            <li><strong>ঠিকানা:</strong> {SITE_CONFIG.address}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
