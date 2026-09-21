"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DecisionPanel({
  applicationId,
  status,
}: {
  applicationId: string;
  status: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function decide(decision: "TERIMA" | "TOLAK" | "PERLU_PERBAIKAN") {
    setError(null);
    setMessage(null);
    setLoading(decision);
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          catatanAdmin: note || undefined,
          alasanTolak: reason || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memproses keputusan");
      setMessage(
        decision === "TERIMA"
          ? "Pengajuan diterima. Surat penerimaan dan akun peserta telah dibuat."
          : decision === "TOLAK"
          ? "Pengajuan ditolak."
          : "Status diperbarui menjadi Perlu Perbaikan."
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(null);
    }
  }

  if (status === "DITERIMA" || status === "DITOLAK") {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-500">
        Pengajuan ini sudah diputuskan.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-stone-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-stone-900">Verifikasi & Keputusan</h2>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Catatan Internal (opsional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Alasan Penolakan (jika menolak)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => decide("TERIMA")}
          disabled={loading !== null}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading === "TERIMA" ? "Memproses..." : "Terima"}
        </button>
        <button
          onClick={() => decide("PERLU_PERBAIKAN")}
          disabled={loading !== null}
          className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {loading === "PERLU_PERBAIKAN" ? "Memproses..." : "Perlu Perbaikan"}
        </button>
        <button
          onClick={() => decide("TOLAK")}
          disabled={loading !== null}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {loading === "TOLAK" ? "Memproses..." : "Tolak"}
        </button>
      </div>
    </div>
  );
}
