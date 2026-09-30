"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompletionStatusBadge } from "@/components/StatusBadge";

type CompletionRequest = {
  id: string;
  status: string;
  note: string | null;
  submittedAt: Date;
};

export default function CompletionRequestPanel({ request }: { request: CompletionRequest }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(decision: "DISETUJUI" | "PERLU_PERBAIKAN" | "DITOLAK") {
    setError(null);
    setLoading(decision);
    try {
      const res = await fetch(`/api/admin/completion-requests/${request.id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, adminNote: note || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memproses");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(null);
    }
  }

  return (
    <li className="py-3 text-sm">
      <div className="flex items-center justify-between">
        <span>{request.submittedAt.toLocaleDateString("id-ID")}</span>
        <CompletionStatusBadge status={request.status} />
      </div>
      {request.note && (
        <p className="mt-2 rounded-md bg-stone-50 px-3 py-2 text-sm text-stone-600">
          Catatan peserta: {request.note}
        </p>
      )}

      {error && (
        <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-3 space-y-2">
        <textarea
          placeholder="Catatan admin (opsional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
        />
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => decide("DISETUJUI")}
            disabled={loading !== null}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {loading === "DISETUJUI" ? "Memproses..." : "Setujui & Terbitkan Surat"}
          </button>
          <button
            onClick={() => decide("PERLU_PERBAIKAN")}
            disabled={loading !== null}
            className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {loading === "PERLU_PERBAIKAN" ? "Memproses..." : "Perlu Perbaikan"}
          </button>
          <button
            onClick={() => decide("DITOLAK")}
            disabled={loading !== null}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading === "DITOLAK" ? "Memproses..." : "Tolak"}
          </button>
        </div>
      </div>
    </li>
  );
}
