import { formatTaka } from "@/lib/format";

type Point = { date: string; total: number; orders: number };

export default function SalesChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400 py-10 text-center">No sales in this period.</p>;
  }
  const max = Math.max(...data.map((d) => d.total), 1);
  const peak = data.reduce((a, b) => (b.total > a.total ? b : a));

  return (
    <div>
      <div className="flex items-end gap-1 h-40">
        {data.map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center justify-end group min-w-0">
            <div
              className="w-full bg-brand-orange/80 hover:bg-brand-orange rounded-t transition-colors"
              style={{ height: `${Math.max((d.total / max) * 100, 1)}%` }}
              title={`${d.date} — ${formatTaka(d.total)} (${d.orders} orders)`}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>{data[0].date}</span>
        <span>Peak: {formatTaka(peak.total)}</span>
        <span>{data[data.length - 1].date}</span>
      </div>
    </div>
  );
}
