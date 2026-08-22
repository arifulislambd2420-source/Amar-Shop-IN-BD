import { dashboardStats, listOrdersWithProductSummary } from "@/lib/orders";
import { listUsers } from "@/lib/users";
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
  const latestOrders = await listOrdersWithProductSummary(10);
  const latestUsers = await listUsers(10);

  const cards = [
    { label: "Total Order", value: stats.totalOrders, color: "from-blue-500 to-blue-600" },
    { label: "Today's Order", value: stats.todayOrders, color: "from-emerald-500 to-emerald-600" },
    { label: "Products", value: stats.totalProducts, color: "from-cyan-500 to-cyan-600" },
    { label: "Customer", value: stats.registeredUsers, color: "from-orange-500 to-orange-600" },
    { label: "Total Stock", value: stats.totalStock, color: "from-purple-500 to-purple-600" },
    { label: "Total Stock Value (৳)", value: formatTaka(stats.stockValue), color: "from-indigo-500 to-indigo-600" },
    { label: "Total Sales (৳)", value: formatTaka(stats.totalSales), color: "from-pink-500 to-pink-600" },
    { label: "Delivered Orders", value: stats.completedOrders, color: "from-slate-600 to-slate-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📊 Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} text-white rounded-xl p-4 shadow-sm`}>
            <div className="text-xs opacity-80 mb-1">{c.label}</div>
            <div className="text-xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mb-6">
        Note: &quot;Available Stock&quot; is omitted — this schema tracks a single stock quantity per product, so it
        would duplicate &quot;Total Stock&quot;. &quot;Net Profit&quot; and &quot;Purchase Value&quot; are also
        omitted — there is no purchase/cost-price field in the products schema, so a profit figure can&apos;t be
        computed honestly.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Latest 10 Orders</h2>
            <Link href="/admin/orders" className="text-brand-orange text-sm font-medium">সব দেখুন →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Invoice #</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4">#{o.id}</td>
                    <td className="py-2 pr-4">{o.productSummary}</td>
                    <td className="py-2 pr-4">{o.invoice_no || `#${o.id}`}</td>
                    <td className="py-2 pr-4 font-medium">{formatTaka(o.total)}</td>
                    <td className="py-2 pr-4">{o.customer_name}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_COLOR[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {latestOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-400">
                      কোনো অর্ডার নেই
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Latest Customers</h2>
            <Link href="/admin/users" className="text-brand-orange text-sm font-medium">সব দেখুন →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {latestUsers.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4">#{u.id}</td>
                    <td className="py-2 pr-4">{u.name}</td>
                    <td className="py-2 pr-4">{u.phone}</td>
                    <td className="py-2 pr-4 text-gray-500">{u.created_at}</td>
                    <td className="py-2 pr-4">
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
                {latestUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-400">
                      কোনো কাস্টমার নেই
                    </td>
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
