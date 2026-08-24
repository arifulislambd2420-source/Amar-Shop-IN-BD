"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Star,
  Monitor,
  Users,
  Sliders,
  Settings,
  Image as ImageIcon,
  BookOpen,
  HelpCircle,
  Menu,
  X,
  Maximize2,
  Minimize2,
  Bell,
  User,
  Globe,
  ChevronRight,
  Headphones,
  ExternalLink,
  Sparkles
} from "lucide-react";

export default function AdminLayoutClient({ children, logo }: { children: React.ReactNode; logo?: string | null }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart, hasArrow: true },
    { href: "/admin/products", label: "Products", icon: Package, hasArrow: true },
    { href: "/admin/categories", label: "Categories", icon: BookOpen, hasArrow: true },
    { href: "/admin/settings/courier", label: "Dropshipping", icon: Truck, hasArrow: true },
    { href: "/admin/reviews", label: "Reviews", icon: Star, hasArrow: true },
    { href: "/admin/banners", label: "Landing Page", icon: Monitor, hasArrow: true },
    { href: "/admin/users", label: "Users", icon: Users, hasArrow: true },
  ];

  const settingItems = [
    { href: "/admin/settings", label: "General Setting Pro", icon: Sliders, hasArrow: true },
    { href: "/admin/settings/site", label: "Site Setting", icon: Settings, hasArrow: true },
    { href: "/admin/banners", label: "Banner & Ads", icon: ImageIcon, hasArrow: true },
    { href: "/admin/blogs", label: "Blogs", icon: BookOpen, hasArrow: true },
    { href: "/admin/settings/smtp", label: "Help Center", icon: HelpCircle, hasArrow: false },
  ];

  return (
    <div className="min-h-screen flex bg-[#f4f6f9] font-sans antialiased text-gray-800">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200/80 text-gray-700 flex flex-col
          transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 md:shrink-0
          shadow-lg md:shadow-none print:hidden
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand / Logo */}
        <div className="h-16 px-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="Logo" className="h-9 w-auto object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-gray-900 leading-none">
                আমার<span className="text-orange-500">শপ</span>
              </span>
              <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mt-0.5">
                Admin Panel
              </span>
            </div>
          </Link>
          <button
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overscroll-contain custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all group
                  ${
                    active
                      ? "bg-orange-50/80 text-orange-600 font-semibold shadow-xs"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-[18px] h-[18px] transition-colors ${
                      active ? "text-orange-500" : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.hasArrow && (
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      active ? "text-orange-400 translate-x-0.5" : "text-gray-300 group-hover:text-gray-400"
                    }`}
                  />
                )}
              </Link>
            );
          })}

          <div className="pt-4 pb-1.5 px-3.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Settings & Tools
            </span>
          </div>

          {settingItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all group
                  ${
                    active
                      ? "bg-orange-50/80 text-orange-600 font-semibold shadow-xs"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-[18px] h-[18px] transition-colors ${
                      active ? "text-orange-500" : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.hasArrow && (
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      active ? "text-orange-400 translate-x-0.5" : "text-gray-300 group-hover:text-gray-400"
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/60 shrink-0">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navbar */}
        <header className="h-16 bg-white border-b border-gray-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs">
          {/* Left: Hamburger & Visit Site Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg md:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Visit Site Pill Button */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Visit Site</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>
          </div>

          {/* Right: Fullscreen, Notifications & Profile Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  1
                </span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-xs text-gray-900">Notifications</span>
                    <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-medium">1 New</span>
                  </div>
                  <div className="p-3">
                    <Link
                      href="/admin/orders"
                      onClick={() => setNotificationsOpen(false)}
                      className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900">New Order Placed</p>
                        <p className="text-[11px] text-gray-500 truncate">Check latest customer order in orders tab</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile Pill Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 py-1.5 px-2.5 rounded-full hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  A
                </div>
                <span className="text-xs font-semibold text-gray-700">Admin</span>
                <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? "rotate-90" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900">Store Administrator</p>
                    <p className="text-[11px] text-gray-400">admin@amarshop.bd</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/admin/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-3.5 h-3.5 text-gray-400" />
                      <span>Settings Hub</span>
                    </Link>
                    <Link
                      href="/admin/users"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>User Management</span>
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 px-3 pt-2 pb-1">
                    <LogoutButton />
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto min-w-0">
          {children}
        </main>

        {/* Admin Footer */}
        <footer className="px-6 py-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 shrink-0">
          <div>
            © {new Date().getFullYear()} <span className="font-semibold text-gray-700">Amar Shop in BD</span>. All rights reserved.
          </div>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs transition-colors"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Developer Support</span>
          </Link>
        </footer>
      </div>
    </div>
  );
}
