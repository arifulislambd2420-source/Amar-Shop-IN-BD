import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 bg-brand-navy text-white flex flex-col shrink-0 print:hidden">
        <div className="px-5 py-5 text-lg font-bold border-b border-white/10">
          আমার<span className="text-brand-orange">শপ</span> Admin
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 text-sm overflow-y-auto">
          <AdminLink href="/admin">📊 Dashboard</AdminLink>
          <AdminLink href="/admin/orders">🧾 Orders</AdminLink>
          <AdminLink href="/admin/products">📦 Products</AdminLink>
          <AdminLink href="/admin/reviews">⭐ Reviews</AdminLink>
          <AdminLink href="/admin/users">👥 Users</AdminLink>
          <div className="px-3 pt-3 pb-1 text-xs uppercase tracking-wide text-white/40">⚙️ Site Setting</div>
          <AdminLink href="/admin/settings/fraud-api">&nbsp;&nbsp;Fraud API</AdminLink>
          <AdminLink href="/admin/settings/smtp">&nbsp;&nbsp;Mail SMTP</AdminLink>
          <AdminLink href="/admin/gtm">🔖 G. Pixel and GTM</AdminLink>
          <AdminLink href="/admin/ip-block">🚫 IP Block</AdminLink>
          <AdminLink href="/admin/banners">🖼️ Banner & Ads</AdminLink>
          <AdminLink href="/admin/blogs">📝 Blogs</AdminLink>
          <AdminLink href="/admin/reports">📈 Reports</AdminLink>
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8 overflow-x-auto print:p-0">{children}</main>
    </div>
  );
}

function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
      {children}
    </Link>
  );
}
