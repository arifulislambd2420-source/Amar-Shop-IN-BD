import {
  dashboardStats,
  salesReport,
  salesSeries,
  topSellingProducts,
  listOrdersWithProductSummary,
  type SalesGranularity,
} from "@/lib/orders";
import { formatTaka } from "@/lib/format";
import SalesChart from "@/components/admin/SalesChart";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
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

  // Date presets (each keeps the current chart granularity).
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

  const [stats, period, chart, topProducts, recentOrders] = await Promise.all([
    dashboardStats(),
    salesReport(from, to),
    salesSeries(from, to, granularity),
    topSellingProducts(5, from, to),
    listOrdersWithProductSummary(8, from, to),
  ]);

  // At-a-glance snapshot cards (current state / fixed windows, not range-scoped).
  const snapshot = [
    { label: "Today's Orders", value: stats.todayOrders, color: "from-blue-500 to-blue-600" },
    { label: "Today's Sales", value: formatTaka(stats.todaySales), color: "from-emerald-500 to-emerald-600" },
    { label: "This Month's Sales", value: formatTaka(stats.monthSales), color: "from-teal-500 to-teal-600" },
    { label: "Customers", value: stats.registeredUsers, color: "from-orange-500 to-orange-600" },
    { label: "Products", value: stats.totalProducts, color: "from-cyan-500 to-cyan-600" },
    { label: "In Stock", value: stats.inStockProducts, color: "from-indigo-500 to-indigo-600" },
    { label: "Out of Stock", value: stats.outOfStockProducts, color: "from-rose-500 to-rose-600" },
  ];

  const periodStatus = [
    { label: "Pending", value: period.byStatus.pending, cls: "text-yellow-700 bg-yellow-50 border-yellow-200" },
    { label: "Processing", value: period.byStatus.processing, cls: "text-blue-700 bg-blue-50 border-blue-200" },
    { label: "Completed", value: period.byStatus.completed, cls: "text-green-700 bg-green-50 border-green-200" },
    { label: "Cancelled & Refunded", value: period.byStatus.cancelled, cls: "text-red-700 bg-red-50 border-red-200" },
  ];

  const rangeQs = (extra: Record<string, string>) =>
    "/admin?" + new URLSearchParams({ from, to, g: granularity, ...extra }).toString();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {snapshot.map((c) => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} text-white rounded-xl p-4 shadow-sm`}>
            <div className="text-xs opacity-80 mb-1">{c.label}</div>
            <div className="text-lg font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => {
              const active = p.from === from && p.to === to;
              return (
                <Link
                  key={p.label}
                  href={`/admin?${new URLSearchParams({ from: p.from, to: p.to, g: granularity })}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                    active ? "bg-brand-navy text-white border-brand-navy" : "border-gray-300 text-gray-600"
                  }`}
                >
                  {p.label}
                </Link>
              );
            })}
          </div>
          <form className="flex items-end gap-2 text-sm">
            <input type="hidden" name="g" value={granularity} />
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">From</span>
              <input type="date" name="from" defaultValue={from} className="input py-1" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">To</span>
              <input type="date" name="to" defaultValue={to} className="input py-1" />
            </label>
            <button className="bg-brand-navy text-white px-3 py-1.5 rounded-lg font-medium">Apply</button>
          </form>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-gradient-to-br from-violet-500 to-violet-600 text-white rounded-xl p-4">
            <div className="text-xs opacity-80 mb-1">Orders</div>
            <div className="text-lg font-bold">{period.totalOrders}</div>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-4">
            <div className="text-xs opacity-80 mb-1">Sales</div>
            <div className="text-lg font-bold">{formatTaka(period.totalSales)}</div>
          </div>
          {periodStatus.map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.cls}`}>
              <div className="text-xs mb-1">{s.label}</div>
              <div className="text-lg font-bold">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold">Sales Chart</h2>
          <div className="flex gap-1 text-sm">
            {(["daily", "weekly", "monthly"] as const).map((gran) => (
              <Link
                key={gran}
                href={rangeQs({ g: gran })}
                className={`px-3 py-1 rounded-lg capitalize ${
                  granularity === gran ? "bg-brand-orange text-white" : "text-gray-600 border border-gray-300"
                }`}
              >
                {gran}
              </Link>
            ))}
          </div>
        </div>
        <SalesChart data={chart} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-brand-orange text-sm font-medium">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-2 pr-4">Invoice</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4">{o.invoice_no || `#${o.id}`}</td>
                    <td className="py-2 pr-4">{o.customer_name}</td>
                    <td className="py-2 pr-4 font-medium">{formatTaka(o.total)}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_COLOR[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-400">No orders in this period</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold mb-4">Best-Selling Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Sold</th>
                  <th className="py-2 pr-4">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p.name} className="border-b border-gray-100">
                    <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                    <td className="py-2 pr-4">{p.name}</td>
                    <td className="py-2 pr-4 font-medium">{p.qty}</td>
                    <td className="py-2 pr-4">{formatTaka(p.revenue)}</td>
                  </tr>
                ))}
                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-400">No sales in this period</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
