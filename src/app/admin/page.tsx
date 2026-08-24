import {
  dashboardStats,
  salesReport,
  salesSeries,
  topSellingProducts,
  listOrdersWithProductSummary,
  type SalesGranularity,
} from "@/lib/orders";
import { getLatestCustomers } from "@/lib/users";
import { formatTaka } from "@/lib/format";
import SalesChart from "@/components/admin/SalesChart";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  ShoppingBag,
  Layers,
  Users,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Receipt,
  TrendingUp,
  DollarSign,
  Truck,
  MoreVertical,
  ArrowRight,
  Tag,
  Share2,
  Mail,
  MessageSquare,
  ShieldAlert,
  Ban,
  Copy,
  BarChart3,
  PackageCheck,
  FilePlus,
  Sliders,
  Calendar,
  Sparkles
} from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_BADGE_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border border-amber-200",
  processing: "bg-blue-100 text-blue-800 border border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border border-purple-200",
  out_for_delivery: "bg-cyan-100 text-cyan-800 border border-cyan-200",
  delivered: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  completed: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  cancelled: "bg-rose-100 text-rose-800 border border-rose-200",
};

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatDateBD(d: string | Date | null | undefined) {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; g?: string }>;
}) {
  const { from: fromParam, to: toParam, g } = await searchParams;
  const granularity: SalesGranularity = g === "weekly" || g === "monthly" ? g : "daily";

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const from = fromParam || isoDate(monthStart);
  const to = toParam || isoDate(today);

  // Date presets
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Monday
  const last30 = new Date(today);
  last30.setDate(today.getDate() - 29);
  const presets = [
    { label: "Today", from: isoDate(today), to: isoDate(today) },
    { label: "This Week", from: isoDate(weekStart), to: isoDate(today) },
    { label: "This Month", from: isoDate(monthStart), to: isoDate(today) },
    { label: "Last 30 Days", from: isoDate(last30), to: isoDate(today) },
  ];

  const [stats, period, chart, topProducts, recentOrders, recentCustomers] = await Promise.all([
    dashboardStats(),
    salesReport(from, to),
    salesSeries(from, to, granularity),
    topSellingProducts(5, from, to),
    listOrdersWithProductSummary(10),
    getLatestCustomers(10),
  ]);

  // 12 Metric Cards config matching the user's screenshot
  const statCards = [
    {
      title: "TOTAL ORDER",
      value: stats.totalOrders,
      icon: ShoppingCart,
      gradient: "from-[#2563eb] to-[#3b82f6]", // Blue
    },
    {
      title: "TODAY'S ORDER",
      value: stats.todayOrders,
      icon: ShoppingBag,
      gradient: "from-[#059669] to-[#10b981]", // Emerald Green
    },
    {
      title: "PRODUCTS",
      value: stats.totalProducts,
      icon: Layers,
      gradient: "from-[#0891b2] to-[#06b6d4]", // Cyan
    },
    {
      title: "CUSTOMER",
      value: stats.uniqueCustomers,
      icon: Users,
      gradient: "from-[#ea580c] to-[#f97316]", // Orange
    },
    {
      title: "TOTAL STOCK",
      value: `${stats.totalStock} Pcs`,
      icon: Boxes,
      gradient: "from-[#4f46e5] to-[#6366f1]", // Indigo
    },
    {
      title: "AVAILABLE STOCK",
      value: `${stats.availableStock} Pcs`,
      icon: CheckCircle2,
      gradient: "from-[#0d9488] to-[#14b8a6]", // Teal
    },
    {
      title: "TOTAL STOCK VALUE",
      value: formatTaka(stats.stockValue),
      icon: CircleDollarSign,
      gradient: "from-[#475569] to-[#64748b]", // Slate-Purple
    },
    {
      title: "PURCHASE VALUE",
      value: formatTaka(stats.purchaseValue),
      icon: CreditCard,
      gradient: "from-[#f97316] to-[#fb923c]", // Salmon-Orange
    },
    {
      title: "TOTAL PURCHASE",
      value: stats.totalPurchase > 0 ? formatTaka(stats.totalPurchase) : "0.00",
      icon: Receipt,
      gradient: "from-[#0284c7] to-[#38bdf8]", // Sky Blue
    },
    {
      title: "TOTAL SALES",
      value: stats.totalSales > 0 ? formatTaka(stats.totalSales) : "0.00",
      icon: TrendingUp,
      gradient: "from-[#16a34a] to-[#22c55e]", // Bright Green
    },
    {
      title: "NET PROFIT",
      value: stats.netProfit > 0 ? formatTaka(stats.netProfit) : "0.00",
      icon: DollarSign,
      gradient: "from-[#e11d48] to-[#f43f5e]", // Rose-Pink
    },
    {
      title: "DELIVERED ORDERS",
      value: stats.deliveredOrders,
      icon: Truck,
      gradient: "from-[#1e293b] to-[#334155]", // Dark Slate Navy
    },
  ];

  // 14 Module Control Cards (matching screenshot 2)
  const moduleCards = [
    {
      title: "Tag Manager",
      description: "Add & update your GTM id",
      actionText: "Update →",
      href: "/admin/gtm",
      icon: Tag,
      iconColor: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "Pixel Manage",
      description: "Add & update your Pixel id",
      actionText: "Update →",
      href: "/admin/gtm",
      icon: Share2,
      iconColor: "text-blue-600 bg-blue-50",
    },
    {
      title: "Mail SMTP",
      description: "Manage your mail system",
      actionText: "Update →",
      href: "/admin/settings/smtp",
      icon: Mail,
      iconColor: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "SMS Gateway",
      description: "Add & update your SMS gateway",
      actionText: "Update →",
      href: "/admin/settings/courier",
      icon: MessageSquare,
      iconColor: "text-purple-600 bg-purple-50",
    },
    {
      title: "Payment Gateway",
      description: "Configure your payment gateway",
      actionText: "Manage →",
      href: "/admin/settings",
      icon: DollarSign,
      iconColor: "text-teal-600 bg-teal-50",
    },
    {
      title: "Courier API",
      description: "Integrate shipping services",
      actionText: "Manage →",
      href: "/admin/settings/courier",
      icon: Truck,
      iconColor: "text-amber-600 bg-amber-50",
    },
    {
      title: "Shipping Charge",
      description: "Add & update your shipping charge",
      actionText: "Create →",
      href: "/admin/settings/courier",
      icon: PackageCheck,
      iconColor: "text-cyan-600 bg-cyan-50",
    },
    {
      title: "Fraud API",
      description: "Integrate fraud check API services",
      actionText: "Update →",
      href: "/admin/settings/fraud-api",
      icon: ShieldAlert,
      iconColor: "text-rose-600 bg-rose-50",
    },
    {
      title: "IP Block",
      description: "Manage blocked IP addresses",
      actionText: "Security →",
      href: "/admin/ip-block",
      icon: Ban,
      iconColor: "text-red-600 bg-red-50",
    },
    {
      title: "Duplicate Order",
      description: "Update your duplicate order setting",
      actionText: "Update →",
      href: "/admin/settings",
      icon: Copy,
      iconColor: "text-violet-600 bg-violet-50",
    },
    {
      title: "Order Reports",
      description: "Check your product order report",
      actionText: "Check →",
      href: "/admin/reports",
      icon: BarChart3,
      iconColor: "text-blue-600 bg-blue-50",
    },
    {
      title: "Stock Report",
      description: "Check your product stock report",
      actionText: "Check →",
      href: "/admin/products",
      icon: Boxes,
      iconColor: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Social Message Manage",
      description: "Manage social media messaging channels",
      actionText: "Manage →",
      href: "/admin/settings",
      icon: MessageSquare,
      iconColor: "text-purple-600 bg-purple-50",
    },
    {
      title: "Create Page",
      description: "Add & update your landing page",
      actionText: "Add →",
      href: "/admin/banners",
      icon: FilePlus,
      iconColor: "text-indigo-600 bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Top 12 Stat Cards Grid (4 columns × 3 rows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className={`bg-gradient-to-r ${c.gradient} text-white rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between min-h-[96px]`}
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-xs">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right flex-1 pl-3">
                <div className="text-[11px] font-bold tracking-wider opacity-90 uppercase">
                  {c.title}
                </div>
                <div className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                  {c.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Dual Live Data Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: LATEST 10 ORDERS */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
          {/* Purple Header Bar */}
          <div className="bg-[#5b46f5] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-4 h-4 text-white/90" />
              <h2 className="font-bold text-sm tracking-wide uppercase">Latest 10 Orders</h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
              title="View all orders"
            >
              <MoreVertical className="w-4 h-4" />
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50/75 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-3 w-8">#</th>
                  <th className="py-2.5 px-3">PRODUCT</th>
                  <th className="py-2.5 px-3">INVOICE</th>
                  <th className="py-2.5 px-3">AMOUNT</th>
                  <th className="py-2.5 px-3">CUSTOMER</th>
                  <th className="py-2.5 px-3 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((o, idx) => (
                  <tr key={o.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-3 text-gray-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 max-w-[180px]">
                        {o.productImage ? (
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={o.productImage}
                              alt={o.productSummary}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center shrink-0">
                            <Layers className="w-4 h-4" />
                          </div>
                        )}
                        <span className="font-medium text-gray-800 truncate" title={o.productSummary}>
                          {o.productSummary}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="bg-gray-100 text-gray-700 font-mono px-2 py-0.5 rounded-full text-[11px] font-semibold border border-gray-200">
                        {o.invoice_no || `${o.id}`}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-bold text-emerald-600">
                      {formatTaka(o.total)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-gray-700 uppercase whitespace-nowrap">
                      {o.customer_name}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          STATUS_BADGE_STYLE[o.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Card: LATEST CUSTOMERS */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
          {/* Green Header Bar */}
          <div className="bg-[#10b981] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-white/90" />
              <h2 className="font-bold text-sm tracking-wide uppercase">Latest Customers</h2>
            </div>
            <Link
              href="/admin/users"
              className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
              title="View all users"
            >
              <MoreVertical className="w-4 h-4" />
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50/75 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-3 w-8">ID</th>
                  <th className="py-2.5 px-3">NAME</th>
                  <th className="py-2.5 px-3">PHONE</th>
                  <th className="py-2.5 px-3">DATE</th>
                  <th className="py-2.5 px-3 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentCustomers.map((c, idx) => (
                  <tr key={c.id || idx} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-3 text-gray-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-3 font-semibold text-gray-800 uppercase whitespace-nowrap">
                      {c.name || "Customer"}
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-600 whitespace-nowrap">
                      {c.phone}
                    </td>
                    <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                      {formatDateBD(c.created_at)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="bg-amber-400/90 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        {c.status || "active"}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No customer records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Module Controls & Quick Settings Grid (from screenshot 2) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-500" />
              <span>Quick Settings & Modules</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Direct shortcuts to manage integrations, marketing tools, APIs, and reports
            </p>
          </div>
          <Link
            href="/admin/settings"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>All Settings</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {moduleCards.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.title}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className={`w-9 h-9 rounded-xl ${m.iconColor} flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                      {m.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {m.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    href={m.href}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>{m.actionText}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Sales Analytics Chart & Range Filter Section */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Sales Overview & Analytics</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Filter sales and performance by date</p>
          </div>

          {/* Granularity & Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              {(["daily", "weekly", "monthly"] as const).map((gran) => (
                <Link
                  key={gran}
                  href={`/admin?from=${from}&to=${to}&g=${gran}`}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    granularity === gran ? "bg-white text-indigo-600 shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {gran}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Date Presets Form */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gray-100">
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => {
              const active = p.from === from && p.to === to;
              return (
                <Link
                  key={p.label}
                  href={`/admin?from=${p.from}&to=${p.to}&g=${granularity}`}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    active
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p.label}
                </Link>
              );
            })}
          </div>

          <form className="flex items-center gap-2 text-xs">
            <input type="hidden" name="g" value={granularity} />
            <div className="flex items-center gap-1">
              <span className="text-gray-400">From:</span>
              <input type="date" name="from" defaultValue={from} className="border border-gray-200 rounded-lg px-2 py-1 bg-white" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">To:</span>
              <input type="date" name="to" defaultValue={to} className="border border-gray-200 rounded-lg px-2 py-1 bg-white" />
            </div>
            <button className="bg-indigo-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
              Filter
            </button>
          </form>
        </div>

        {/* Chart View */}
        <div className="pt-2">
          <SalesChart data={chart} />
        </div>
      </div>
    </div>
  );
}
