import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white/80 mt-16">
      <div className="container-x py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="text-white text-lg font-bold mb-2">
            আমার<span className="text-brand-orange">শপ</span>
          </div>
          <p>খাঁটি ও প্রাকৃতিক পণ্যের অনলাইন দোকান। মধু, সরিষার তেল, ঘি, খেজুর — সরাসরি আপনার দোরগোড়ায়।</p>
          <div className="flex items-center gap-3 mt-4">
            <a href={SITE_CONFIG.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-brand-orange"><FacebookIcon /></a>
            <a href={SITE_CONFIG.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-brand-orange"><YoutubeIcon /></a>
            <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-brand-orange"><InstagramIcon /></a>
          </div>
        </div>
        <div>
          <div className="text-white font-semibold mb-2">গুরুত্বপূর্ণ লিংক</div>
          <ul className="space-y-1">
            <li><Link href="/about" className="hover:text-brand-orange">আমাদের সম্পর্কে</Link></li>
            <li><Link href="/shop" className="hover:text-brand-orange">সকল পণ্য (Shop)</Link></li>
            <li><Link href="/offers" className="hover:text-brand-orange">অফার সমূহ</Link></li>
            <li><Link href="/blog" className="hover:text-brand-orange">ব্লগ ও টিপস</Link></li>
            <li><Link href="/track" className="hover:text-brand-orange">অর্ডার ট্র্যাকিং</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-white font-semibold mb-2">পলিসি ও নিয়মাবলী</div>
          <ul className="space-y-1">
            <li><Link href="/delivery" className="hover:text-brand-orange">ডেলিভারি পলিসি</Link></li>
            <li><Link href="/returns" className="hover:text-brand-orange">রিটার্ন ও রিফান্ড পলিসি</Link></li>
            <li><Link href="/privacy" className="hover:text-brand-orange">প্রাইভেসি পলিসি</Link></li>
            <li><Link href="/terms" className="hover:text-brand-orange">ব্যবহারের শর্তাবলী</Link></li>
            <li><Link href="/contact" className="hover:text-brand-orange">যোগাযোগ ও হেল্পলাইন</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-white font-semibold mb-2">যোগাযোগ</div>
          <p>ফোন: <a href={`tel:${SITE_CONFIG.supportPhoneRaw}`} className="hover:text-brand-orange">{SITE_CONFIG.supportPhone}</a></p>
          <p className="mt-1">ইমেইল: <a href={`mailto:${SITE_CONFIG.supportEmail}`} className="hover:text-brand-orange">{SITE_CONFIG.supportEmail}</a></p>
          <p className="mt-1 text-xs text-white/60">ঠিকানা: {SITE_CONFIG.address}</p>
          <div className="text-white font-semibold mt-4 mb-2">পেমেন্ট মেথড</div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-white/10 px-2 py-1 rounded">bKash</span>
            <span className="bg-white/10 px-2 py-1 rounded">Nagad</span>
            <span className="bg-white/10 px-2 py-1 rounded">Rocket</span>
            <span className="bg-white/10 px-2 py-1 rounded">Cash on Delivery</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        &copy; {new Date().getFullYear()} {SITE_CONFIG.name} ({SITE_CONFIG.legalName}) — সব অধিকার সংরক্ষিত
      </div>
    </footer>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" />
    </svg>
  );
}
function YoutubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 12s0-3.6-.5-5.3a3 3 0 0 0-2.1-2.1C18.7 4 12 4 12 4s-6.7 0-8.4.6A3 3 0 0 0 1.5 6.7C1 8.4 1 12 1 12s0 3.6.5 5.3a3 3 0 0 0 2.1 2.1C5.3 20 12 20 12 20s6.7 0 8.4-.6a3 3 0 0 0 2.1-2.1C23 15.6 23 12 23 12z" />
      <path d="M10 15.5l6-3.5-6-3.5v7z" fill="#1a2440" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
