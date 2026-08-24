"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import type { Category, Product } from "@/lib/types";
import { formatTaka } from "@/lib/format";

import { SITE_CONFIG } from "@/lib/site-config";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/offers", label: "Offers" },
  { href: "/shop", label: "Shop" },
  { href: "/brands", label: "Brands" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Header({ isAdmin, logo }: { isAdmin?: boolean; logo?: string | null }) {
  const cartCount = useCartStore((s) => s.count());
  const wishlistCount = useWishlistStore((s) => s.count());
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 bg-white text-gray-800 shadow-sm">
      <div className="container-x flex items-center gap-3 md:gap-4 h-16">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          aria-label="মেনু খুলুন"
          className="md:hidden p-2 -ml-2 text-gray-700 hover:text-brand-orange focus:outline-none"
        >
          <MenuIcon />
        </button>

        <Link href="/" className="text-xl font-bold tracking-tight shrink-0">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="আমারশপ" className="h-8 w-auto object-contain" />
          ) : (
            <>
              আমার<span className="text-brand-orange">শপ</span>
            </>
          )}
        </Link>

        <div className="hidden md:block flex-1 max-w-xl">
          <SearchBar />
        </div>

        <div className="flex items-center gap-3 md:gap-4 ml-auto text-gray-600">
          <a href={`tel:${SITE_CONFIG.supportPhoneRaw}`} className="hidden lg:flex items-center gap-2 text-sm hover:text-brand-orange">
            <PhoneIcon />
            <span>{SITE_CONFIG.supportPhone}</span>
          </a>
          <Link href="/track" aria-label="অর্ডার ট্র্যাকিং" className="hover:text-brand-orange">
            <TrackIcon />
          </Link>
          <Link href="/wishlist" aria-label="পছন্দের তালিকা" className="relative hover:text-brand-orange">
            <HeartIcon />
            {mounted && wishlistCount > 0 && <Badge count={wishlistCount} />}
          </Link>
          <Link href="/cart" aria-label="কার্ট" className="relative hover:text-brand-orange">
            <CartIcon />
            {mounted && cartCount > 0 && <Badge count={cartCount} />}
          </Link>
        </div>
      </div>

      <div className="md:hidden container-x pb-3">
        <SearchBar />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isAdmin={isAdmin}
        logo={logo}
      />

      <nav className="hidden md:block border-t border-gray-100 bg-white">
        <div className="container-x flex items-center h-11 gap-6 text-sm font-medium">
          <CategoriesMenu />
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand-orange">
              {l.label}
            </Link>
          ))}
          <div className="ml-auto flex items-center gap-4">
            {isAdmin && (
              <Link href="/admin" className="text-brand-orange font-bold flex items-center gap-1 hover:underline">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Admin Panel
              </Link>
            )}
            <Link href="/customer/login" className="hover:text-brand-orange">
              Login
            </Link>
            <Link href="/customer/register" className="hover:text-brand-orange">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
      {count > 9 ? "9+" : count}
    </span>
  );
}

function CategoriesMenu() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function ensureLoaded() {
    if (loaded) return;
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch {
      setCategories([]);
    } finally {
      setLoaded(true);
    }
  }

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => {
        ensureLoaded();
        setOpen(true);
      }}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => {
          ensureLoaded();
          setOpen((v) => !v);
        }}
        className="flex items-center gap-1.5 bg-brand-orange text-white px-3 h-11 font-semibold"
      >
        <MenuIcon />
        All Categories
      </button>
      {open && (
        <div className="absolute left-0 top-full w-64 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50">
          {categories.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">লোড হচ্ছে...</p>
          ) : (
            <ul className="py-2">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/shop?category=${c.slug}`}
                    className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-brand-orange"
                    onClick={() => setOpen(false)}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.products ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function goToShop() {
    if (!query.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex">
        <input
          className="input rounded-r-none"
          placeholder="পণ্য খুঁজুন..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && goToShop()}
        />
        <button
          onClick={goToShop}
          aria-label="সার্চ"
          className="bg-brand-orange text-white px-4 rounded-r-lg hover:bg-brand-orange-dark"
        >
          <SearchIcon />
        </button>
      </div>
      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-auto">
          {loading ? (
            <p className="p-4 text-sm text-gray-400">খোঁজা হচ্ছে...</p>
          ) : results.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">কোনো পণ্য পাওয়া যায়নি</p>
          ) : (
            <ul className="py-1">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/product/${p.slug}`}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50"
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-sm flex-1 line-clamp-1">{p.name}</span>
                    <span className="text-brand-orange text-sm font-semibold">
                      {formatTaka(p.sale_price ?? p.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function TrackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <path d="M16 8h4l3 3v5h-7z" />
      <circle cx="5.5" cy="18.5" r="1.5" />
      <circle cx="18.5" cy="18.5" r="1.5" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function MobileDrawer({
  isOpen,
  onClose,
  isAdmin,
  logo,
}: {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  logo?: string | null;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [catOpen, setCatOpen] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetch("/api/categories")
        .then((r) => r.json())
        .then((d) => setCategories(d.categories ?? []))
        .catch(() => {});
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-white h-full flex flex-col shadow-2xl z-10 overflow-hidden animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 bg-brand-navy text-white flex items-center justify-between">
          <Link href="/" onClick={onClose} className="text-xl font-bold tracking-tight">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="আমারশপ" className="h-8 w-auto object-contain bg-white rounded px-1" />
            ) : (
              <>
                আমার<span className="text-brand-orange">শপ</span>
              </>
            )}
          </Link>
          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="p-1 text-white/80 hover:text-white rounded-lg"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User / Admin Action Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-3 flex flex-wrap gap-2 text-xs font-semibold">
          {isAdmin && (
            <Link
              href="/admin"
              onClick={onClose}
              className="w-full bg-brand-orange text-white py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-xs"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Admin Dashboard
            </Link>
          )}
          <Link
            href="/customer/login"
            onClick={onClose}
            className="flex-1 bg-white border border-gray-300 py-1.5 px-3 rounded-lg text-center text-gray-700 hover:border-brand-orange hover:text-brand-orange"
          >
            লগইন (Login)
          </Link>
          <Link
            href="/customer/register"
            onClick={onClose}
            className="flex-1 bg-brand-navy text-white py-1.5 px-3 rounded-lg text-center hover:bg-opacity-90"
          >
            রেজিস্টার
          </Link>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {/* Main Navigation Links */}
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">মেনু</p>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={onClose}
                className="block py-2 px-2.5 rounded-lg font-medium text-gray-700 hover:bg-orange-50 hover:text-brand-orange transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/track"
              onClick={onClose}
              className="block py-2 px-2.5 rounded-lg font-medium text-gray-700 hover:bg-orange-50 hover:text-brand-orange transition-colors"
            >
              📦 অর্ডার ট্র্যাক করুন
            </Link>
          </div>

          {/* Categories Section */}
          <div className="border-t border-gray-100 pt-3">
            <button
              onClick={() => setCatOpen(!catOpen)}
              className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2"
            >
              <span>সকল ক্যাটাগরি</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform ${catOpen ? "rotate-180" : ""}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {catOpen && (
              <div className="space-y-1 pl-1">
                {categories.length === 0 ? (
                  <p className="text-xs text-gray-400 py-1">লোড হচ্ছে...</p>
                ) : (
                  categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/shop?category=${c.slug}`}
                      onClick={onClose}
                      className="block py-1.5 px-2 rounded text-xs text-gray-600 hover:bg-gray-100 hover:text-brand-orange"
                    >
                      • {c.name}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contact Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs space-y-2">
          <a
            href={`tel:${SITE_CONFIG.supportPhoneRaw}`}
            className="flex items-center gap-2 text-gray-700 hover:text-brand-orange"
          >
            <PhoneIcon />
            <span>হেল্পলাইন: {SITE_CONFIG.supportPhone}</span>
          </a>
          <a
            href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-green-600 font-medium"
          >
            <span>💬 হোয়াটসঅ্যাপে চ্যাট করুন</span>
          </a>
        </div>
      </div>
    </div>
  );
}
