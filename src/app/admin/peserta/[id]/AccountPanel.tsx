"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountPanel({
  participantId,
  email,
  isActive,
}: {
  participantId: string;
  email: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"status" | "link" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [setupUrl, setSetupUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function toggleStatus() {
    setError(null);
    setLoading("status");
    try {
      const res = await fetch(`/api/admin/participants/${participantId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengubah status");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(null);
    }
  }

  async function generateLink() {
    setError(null);
    setSetupUrl(null);
    setCopied(false);
    setLoading("link");
    try {
      const res = await fetch(`/api/admin/participants/${participantId}/reset-link`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat link");
      setSetupUrl(`${window.location.origin}${json.setupUrl}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(null);
    }
  }

  async function copyLink() {
    if (!setupUrl) return;
    await navigator.clipboard.writeText(setupUrl);
    setCopied(true);
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-stone-900">Kelola Akun Peserta</h2>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-700">{email}</p>
          <p className="text-xs text-stone-400">Email login peserta</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          }`}
        >
          {isActive ? "Aktif" : "Nonaktif"}
        </span>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={toggleStatus}
          disabled={loading !== null}
          className={`rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
            isActive ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {loading === "status" ? "Memproses..." : isActive ? "Nonaktifkan Akun" : "Aktifkan Akun"}
        </button>
        <button
          onClick={generateLink}
          disabled={loading !== null}
          className="rounded-md border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-60"
        >
          {loading === "link" ? "Membuat link..." : "Buat Link Setup Password"}
        </button>
      </div>

      {setupUrl && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs text-emerald-800">
            Bagikan tautan ini ke peserta secara manual (WhatsApp/lainnya) — tautan ini tidak dikirim otomatis lewat email:
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="break-all rounded bg-white px-2 py-1 text-xs text-stone-700">
              {setupUrl}
            </code>
            <button
              onClick={copyLink}
              className="rounded-md bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-900"
            >
              {copied ? "Tersalin!" : "Salin"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
