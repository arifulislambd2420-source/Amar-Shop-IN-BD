"use client";

import { useEffect, useState } from "react";

export default function FeedUrlCopy() {
  const [url, setUrl] = useState("/api/feed/facebook");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}/api/feed/facebook`);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — user can still select the text */
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h2 className="font-semibold text-sm">Product Feed (Google Merchant / Meta Catalog)</h2>
        <a href={url} target="_blank" rel="noreferrer" className="text-xs text-brand-orange font-medium">
          Open →
        </a>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        Google Merchant বা Meta Commerce-এ এই URL টা &quot;scheduled feed&quot; হিসেবে যোগ করুন — পণ্য অটো-সিঙ্ক হবে।
      </p>
      <div className="flex items-center gap-2">
        <input readOnly value={url} className="input flex-1 text-xs font-mono" onFocus={(e) => e.target.select()} />
        <button
          onClick={copy}
          className="bg-brand-navy text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
    </div>
  );
}
