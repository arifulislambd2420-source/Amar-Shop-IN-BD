import { dashboardStats, listOrders } from "@/lib/orders";
import { formatTaka } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default async function AdminDashboardPage() {
  const stats = await dashboardStats();
  const latestOrders = await listOrders(10);

  const cards = [
    { label: "Total Orders", value: stats.totalOrders, color: "bg-blue-500" },
    { label: "Today's Orders", value: stats.todayOrders, color: "bg-emerald-500" },
    { label: "Products", value: stats.totalProducts, color: "bg-cyan-500" },
    { label: "Customers", value: stats.uniqueCustomers, color: "bg-orange-500" },
    { label: "Total Stock", value: stats.totalStock, color: "bg-purple-500" },
    { label: "Stock Value", value: formatTaka(stats.stockValue), color: "bg-indigo-500" },
    { label: "Total Sales", value: formatTaka(stats.totalSales), color: "bg-pink-500" },
    { label: "Delivered Orders", value: stats.completedOrders, color: "bg-slate-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📊 Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`${c.color} text-white rounded-xl p-4`}>
            <div className="text-xs opacity-80 mb-1">{c.label}</div>
            <div className="text-xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Latest Orders</h2>
          <Link href="/admin/orders" className="text-brand-orange text-sm font-medium">সব দেখুন →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {latestOrders.map((o) => (
                <tr key={o.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4">#{o.id}</td>
                  <td className="py-2 pr-4">{o.customer_name}</td>
                  <td className="py-2 pr-4 font-medium">{formatTaka(o.total)}</td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_COLOR[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-gray-500">{o.created_at}</td>
                </tr>
              ))}
              {latestOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-400">
                    কোনো অর্ডার নেই
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
