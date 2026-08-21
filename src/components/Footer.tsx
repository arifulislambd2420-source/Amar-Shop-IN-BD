export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white/80 mt-16">
      <div className="container-x py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="text-white text-lg font-bold mb-2">
            আমার<span className="text-brand-orange">শপ</span>
          </div>
          <p>খাঁটি ও প্রাকৃতিক পণ্যের অনলাইন দোকান।</p>
        </div>
        <div>
          <div className="text-white font-semibold mb-2">লিংক</div>
          <ul className="space-y-1">
            <li><a href="/shop" className="hover:text-brand-orange">শপ</a></li>
            <li><a href="/track" className="hover:text-brand-orange">অর্ডার ট্র্যাকিং</a></li>
          </ul>
        </div>
        <div>
          <div className="text-white font-semibold mb-2">যোগাযোগ</div>
          <p>ফোন: 01XXXXXXXXX</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        &copy; {new Date().getFullYear()} আমারশপ — সব অধিকার সংরক্ষিত
      </div>
    </footer>
  );
}
