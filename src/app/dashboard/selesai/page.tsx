"use client";

import { FormEvent, useEffect, useState } from "react";
import { CompletionStatusBadge } from "@/components/StatusBadge";

type CompletionRequest = {
  id: string;
  status: string;
  note: string | null;
  adminNote: string | null;
  submittedAt: string;
};

export default function SelesaiPage() {
  const [requests, setRequests] = useState<CompletionRequest[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/participant/completion");
    const json = await res.json();
    setRequests(json.requests ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    load();
  }, []);

  const hasActive = requests.some((r) => r.status === "DIAJUKAN" || r.status === "DISETUJUI");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/participant/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengirim pengajuan");
      setNote("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-serif font-bold text-stone-900">Pengajuan Selesai Magang</h1>
      <p className="mt-1 text-sm text-stone-500">
        Ajukan setelah Anda menyelesaikan masa magang. Ini bukan pengunduran
        diri.
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!hasActive && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-lg border border-stone-200 bg-white p-5">
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Catatan (opsional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
          >
            {submitting ? "Mengirim..." : "Ajukan Selesai Magang"}
          </button>
        </form>
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-stone-900">Riwayat Pengajuan</h2>
        <div className="space-y-3">
          {requests.length === 0 && (
            <p className="text-sm text-stone-400">Belum ada pengajuan selesai magang.</p>
          )}
          {requests.map((r) => (
            <div key={r.id} className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">
                  {new Date(r.submittedAt).toLocaleDateString("id-ID")}
                </span>
                <CompletionStatusBadge status={r.status} />
              </div>
              {r.note && <p className="mt-2 text-sm text-stone-600">Catatan: {r.note}</p>}
              {r.adminNote && (
                <p className="mt-1 text-sm text-stone-600">Catatan admin: {r.adminNote}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
