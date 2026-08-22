import { salesReport } from "@/lib/orders";
import { formatTaka } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};

function defaultRange() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 30);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const defaults = defaultRange();
  const from = params.from || defaults.from;
  const to = params.to || defaults.to;

  const report = await salesReport(from, to);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📈 Sales Report</h1>

      <form method="get" className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">From</span>
          <input type="date" name="from" defaultValue={from} className="input" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">To</span>
          <input type="date" name="to" defaultValue={to} className="input" />
        </label>
        <button className="bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold px-4 py-2 rounded-lg text-sm">
          Filter
        </button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-sm">
          <div className="text-xs opacity-80 mb-1">Total Orders</div>
          <div className="text-xl font-bold">{report.totalOrders}</div>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-4 shadow-sm">
          <div className="text-xs opacity-80 mb-1">Total Sales (৳)</div>
          <div className="text-xl font-bold">{formatTaka(report.totalSales)}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Order Count</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).map((status) => (
              <tr key={status} className="border-b border-gray-100">
                <td className="py-2 px-4">{STATUS_LABEL[status]}</td>
                <td className="py-2 px-4">{report.byStatus[status as keyof typeof report.byStatus]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
