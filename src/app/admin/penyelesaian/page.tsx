"use client";

import { useEffect, useState } from "react";
import { CompletionStatusBadge } from "@/components/StatusBadge";

type CompletionRequest = {
  id: string;
  status: string;
  note: string | null;
  adminNote: string | null;
  submittedAt: string;
  application: { namaLengkap: string; institusi: string; nomorPengajuan: string };
  user: { email: string };
};

export default function AdminPenyelesaianPage() {
  const [requests, setRequests] = useState<CompletionRequest[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function load() {
    const res = await fetch("/api/admin/completion-requests");
    const json = await res.json();
    setRequests(json.requests ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    load();
  }, []);

  async function decide(id: string, decision: "DISETUJUI" | "PERLU_PERBAIKAN" | "DITOLAK") {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/completion-requests/${id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, adminNote: notes[id] || undefined }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Gagal memproses");
        return;
      }
      await load();
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-serif font-bold text-stone-900">Penyelesaian Magang</h1>

      <div className="mt-6 space-y-4">
        {requests.length === 0 && (
          <p className="text-sm text-stone-400">Belum ada pengajuan selesai magang.</p>
        )}
        {requests.map((r) => (
          <div key={r.id} className="rounded-lg border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-stone-900">{r.application.namaLengkap}</p>
                <p className="text-xs text-stone-400">
                  {r.application.nomorPengajuan} · {r.application.institusi}
                </p>
              </div>
              <CompletionStatusBadge status={r.status} />
            </div>
            {r.note && (
              <p className="mt-2 rounded-md bg-stone-50 px-3 py-2 text-sm text-stone-600">
                Catatan peserta: {r.note}
              </p>
            )}
            {r.status === "DIAJUKAN" && (
              <div className="mt-4 space-y-3">
                <textarea
                  placeholder="Catatan admin (opsional)"
                  value={notes[r.id] || ""}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                  rows={2}
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => decide(r.id, "DISETUJUI")}
                    disabled={loadingId === r.id}
                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                  >
                    Setujui & Terbitkan Surat
                  </button>
                  <button
                    onClick={() => decide(r.id, "PERLU_PERBAIKAN")}
                    disabled={loadingId === r.id}
                    className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                  >
                    Perlu Perbaikan
                  </button>
                  <button
                    onClick={() => decide(r.id, "DITOLAK")}
                    disabled={loadingId === r.id}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
