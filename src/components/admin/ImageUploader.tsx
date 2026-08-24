"use client";

import { useState, useRef } from "react";

export default function ImageUploader({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
      } else {
        onChange(data.url);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-3">
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Preview" className="w-12 h-12 rounded object-cover bg-gray-50 border border-gray-200" />
        )}
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input text-xs text-gray-500 font-mono w-full"
            placeholder="https://..."
          />
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-60 whitespace-nowrap"
        >
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      </div>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  );
}
