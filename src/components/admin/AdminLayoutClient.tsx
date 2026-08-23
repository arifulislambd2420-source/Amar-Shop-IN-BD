"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-brand-navy text-white px-4 py-3 shadow-md shrink-0 print:hidden">
        <div className="text-lg font-bold">
          আমার<span className="text-brand-orange">শপ</span> Admin
        </div>
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 -mr-2 text-white/80 hover:text-white"
          aria-label="Open menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-brand-navy text-white flex flex-col transform transition-transform duration-300 ease-in-out
        md:relative md:w-56 md:translate-x-0 print:hidden
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="px-5 py-5 text-lg font-bold border-b border-white/10 flex justify-between items-center">
          <div>আমার<span className="text-brand-orange">শপ</span> Admin</div>
          <button 
            className="md:hidden p-1 text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 text-sm overflow-y-auto">
          <AdminLink href="/admin" onClick={() => setSidebarOpen(false)}>📊 Dashboard</AdminLink>
          <AdminLink href="/admin/orders" onClick={() => setSidebarOpen(false)}>🧾 Orders</AdminLink>
          <AdminLink href="/admin/products" onClick={() => setSidebarOpen(false)}>📦 Products</AdminLink>
          <AdminLink href="/admin/products/import" onClick={() => setSidebarOpen(false)}>&nbsp;&nbsp;Import/Export</AdminLink>
          <AdminLink href="/admin/reviews" onClick={() => setSidebarOpen(false)}>⭐ Reviews</AdminLink>
          <AdminLink href="/admin/users" onClick={() => setSidebarOpen(false)}>👥 Users</AdminLink>
          <AdminLink href="/admin/coupons" onClick={() => setSidebarOpen(false)}>🎟️ Coupons</AdminLink>
          <AdminLink href="/admin/flash-sales" onClick={() => setSidebarOpen(false)}>⚡ Flash Sales</AdminLink>
          <div className="px-3 pt-3 pb-1 text-xs uppercase tracking-wide text-white/40">⚙️ Site Setting</div>
          <AdminLink href="/admin/settings/courier" onClick={() => setSidebarOpen(false)}>&nbsp;&nbsp;Courier API</AdminLink>
          <AdminLink href="/admin/settings/fraud-api" onClick={() => setSidebarOpen(false)}>&nbsp;&nbsp;Fraud API</AdminLink>
          <AdminLink href="/admin/settings/smtp" onClick={() => setSidebarOpen(false)}>&nbsp;&nbsp;Mail SMTP</AdminLink>
          <AdminLink href="/admin/gtm" onClick={() => setSidebarOpen(false)}>🔖 G. Pixel and GTM</AdminLink>
          <AdminLink href="/admin/ip-block" onClick={() => setSidebarOpen(false)}>🚫 IP Block</AdminLink>
          <AdminLink href="/admin/banners" onClick={() => setSidebarOpen(false)}>🖼️ Banner & Ads</AdminLink>
          <AdminLink href="/admin/blogs" onClick={() => setSidebarOpen(false)}>📝 Blogs</AdminLink>
          <AdminLink href="/admin/reports" onClick={() => setSidebarOpen(false)}>📈 Reports</AdminLink>
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-x-auto print:p-0 min-w-0">
        {children}
      </main>
    </div>
  );
}

function AdminLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
      {children}
    </Link>
  );
}
