"use client";

import { useState } from "react";
import Link from "next/link";

const FIELDS: { value: string; label: string }[] = [
  { value: "", label: "— Ignore —" },
  { value: "name", label: "Name" },
  { value: "slug", label: "Slug" },
  { value: "sku", label: "SKU" },
  { value: "status", label: "Status" },
  { value: "category", label: "Category" },
  { value: "brand", label: "Brand" },
  { value: "regular_price", label: "Regular Price" },
  { value: "sale_price", label: "Sale Price" },
  { value: "stock", label: "Stock" },
  { value: "description", label: "Description" },
  { value: "seo_title", label: "SEO Title" },
  { value: "meta_description", label: "Meta Description" },
  { value: "tags", label: "Tags" },
];

const PREVIEW_FIELDS = [
  "name",
  "sku",
  "status",
  "category",
  "brand",
  "regular_price",
  "sale_price",
  "stock",
];

type Mode = "create_only" | "update_only" | "both" | "dry_run";
type Counts = { create: number; update: number; skip: number; reject: number };
type ImportError = { row: number; reason: string };
type Result = {
  headers: string[];
  preview: Record<string, string>[];
  counts: Counts;
  errors: ImportError[];
};

const ALIASES: Record<string, string> = {
  name: "name",
  productname: "name",
  title: "name",
  slug: "slug",
  permalink: "slug",
  sku: "sku",
  code: "sku",
  status: "status",
  category: "category",
  categories: "category",
  categoryname: "category",
  brand: "brand",
  regularprice: "regular_price",
  price: "regular_price",
  saleprice: "sale_price",
  discountprice: "sale_price",
  stock: "stock",
  quantity: "stock",
  qty: "stock",
  description: "description",
  desc: "description",
  content: "description",
  seotitle: "seo_title",
  metatitle: "seo_title",
  metadescription: "meta_description",
  tags: "tags",
  tag: "tags",
};

function autoMap(headers: string[]): Record<string, string> {
  const m: Record<string, string> = {};
  for (const h of headers) {
    const norm = h.toLowerCase().replace(/[\s_-]+/g, "");
    m[h] = ALIASES[norm] || "";
  }
  return m;
}

export default function ProductImport() {
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<Mode>("both");
  const [analysis, setAnalysis] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [committed, setCommitted] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setAnalysis(null);
    setCommitted(null);
    const text = await file.text();
    setCsvText(text);
    setFileName(file.name);
    // First analyze with empty mapping to detect headers
    const res = await fetch("/api/admin/products/import/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: text, mapping: {}, mode }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "ফাইল পড়া যায়নি");
      return;
    }
    const hdrs: string[] = data.headers || [];
    setHeaders(hdrs);
    const auto = autoMap(hdrs);
    setMapping(auto);
    await runAnalyze(text, auto, mode);
  }

  async function runAnalyze(text: string, map: Record<string, string>, m: Mode) {
    setBusy(true);
    setError("");
    setCommitted(null);
    try {
      const res = await fetch("/api/admin/products/import/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: text, mapping: map, mode: m }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "বিশ্লেষণ ব্যর্থ");
        return;
      }
      setAnalysis(data);
    } catch {
      setError("নেটওয়ার্ক সমস্যা");
    } finally {
      setBusy(false);
    }
  }

  async function runCommit() {
    if (!csvText) return;
    if (mode !== "dry_run" && !confirm("ইমপোর্ট চালাবেন? এটি ডাটাবেস পরিবর্তন করবে।")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/products/import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvText, mapping, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ইমপোর্ট ব্যর্থ");
        return;
      }
      setCommitted(data);
    } catch {
      setError("নেটওয়ার্ক সমস্যা");
    } finally {
      setBusy(false);
    }
  }

  function downloadErrors(errors: ImportError[]) {
    const rows = [
      '"row","reason"',
      ...errors.map((e) => `"${e.row}","${e.reason.replace(/"/g, '""')}"`),
    ];
    const csv = "﻿" + rows.join("\r\n") + "\r\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "import-errors.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const shown = committed || analysis;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📥 Product Import / Export</h1>
        <Link href="/admin/products" className="text-brand-orange font-medium text-sm">
          ← Products
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex flex-wrap gap-3 items-center">
        <a href="/api/admin/products/import/template" className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
          ⬇️ Download sample template
        </a>
        <a href="/api/admin/products/export" className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
          ⬇️ Export products (all)
        </a>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="font-semibold mb-3">1. Upload CSV</h2>
        <input type="file" accept=".csv,text/csv" onChange={onFile} className="text-sm" />
        {fileName && <p className="text-sm text-gray-500 mt-2">নির্বাচিত: {fileName}</p>}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {headers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold mb-3">2. Map columns</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {headers.map((h) => (
              <label key={h} className="flex items-center gap-2 text-sm">
                <span className="w-40 truncate text-gray-600" title={h}>{h}</span>
                <span className="text-gray-400">→</span>
                <select
                  value={mapping[h] ?? ""}
                  onChange={(e) => {
                    const next = { ...mapping, [h]: e.target.value };
                    setMapping(next);
                  }}
                  className="input flex-1"
                >
                  {FIELDS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium">Mode:</span>
              {(["create_only", "update_only", "both", "dry_run"] as Mode[]).map((m) => (
                <label key={m} className="flex items-center gap-1">
                  <input type="radio" name="mode" checked={mode === m} onChange={() => setMode(m)} />
                  {m.replace("_", " ")}
                </label>
              ))}
            </div>
            <button
              onClick={() => runAnalyze(csvText, mapping, mode)}
              disabled={busy}
              className="bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {busy ? "..." : "Analyze"}
            </button>
          </div>
        </div>
      )}

      {analysis && analysis.preview.length > 0 && !committed && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 overflow-x-auto">
          <h2 className="font-semibold mb-3">3. Preview (first 10 mapped rows)</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                {PREVIEW_FIELDS.map((f) => (
                  <th key={f} className="py-2 pr-4">{f}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analysis.preview.map((row, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {PREVIEW_FIELDS.map((f) => (
                    <td key={f} className="py-2 pr-4 max-w-[160px] truncate">{row[f]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {shown && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold mb-3">{committed ? "Import complete" : "Validation summary"}</h2>
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <Stat label="Create" value={shown.counts.create} color="text-green-600" />
            <Stat label="Update" value={shown.counts.update} color="text-blue-600" />
            <Stat label="Skip" value={shown.counts.skip} color="text-gray-500" />
            <Stat label="Reject" value={shown.counts.reject} color="text-red-600" />
          </div>

          {shown.errors.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm text-red-600">Errors ({shown.errors.length})</h3>
                <button onClick={() => downloadErrors(shown.errors)} className="text-brand-orange text-sm font-medium">
                  ⬇️ Download error report
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="py-1.5 px-3">Row</th>
                      <th className="py-1.5 px-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.errors.map((e, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-1.5 px-3">{e.row}</td>
                        <td className="py-1.5 px-3">{e.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!committed && (
            <button
              onClick={runCommit}
              disabled={busy}
              className="bg-brand-orange text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
            >
              {busy ? "চলছে..." : mode === "dry_run" ? "Run Dry-run" : "Run Import"}
            </button>
          )}
          {committed && (
            <p className="text-sm text-green-700">
              {mode === "dry_run" ? "Dry-run সম্পন্ন — কোনো পরিবর্তন হয়নি।" : "ইমপোর্ট সম্পন্ন হয়েছে।"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="border border-gray-200 rounded-lg px-4 py-2">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
