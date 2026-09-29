"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DOCUMENT_TYPE_LABEL,
  PENGAJUAN_DOCUMENT_TYPES,
  REJECTION_CATEGORY_LABEL,
} from "@/lib/constants";

export default function DecisionPanel({
  applicationId,
  status,
  nomorSuratAsal,
  tanggalSuratAsal,
  existingAccountNote,
}: {
  applicationId: string;
  status: string;
  nomorSuratAsal?: string | null;
  tanggalSuratAsal?: string | null;
  existingAccountNote?: { tone: "conflict" | "info"; message: string } | null;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [suratAsal, setSuratAsal] = useState(nomorSuratAsal || "");
  const [tanggalAsal, setTanggalAsal] = useState(tanggalSuratAsal || "");
  const [missingDocs, setMissingDocs] = useState<string[]>([]);
  const [reasonCategory, setReasonCategory] = useState<"KUOTA_PENUH" | "LAINNYA">("LAINNYA");

  function toggleMissingDoc(type: string) {
    setMissingDocs((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }
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
          alasanTolakKategori: decision === "TOLAK" ? reasonCategory : undefined,
          dokumenPerluDiperbaiki: decision === "PERLU_PERBAIKAN" ? missingDocs : undefined,
          nomorSuratAsal: decision === "TERIMA" ? suratAsal || undefined : undefined,
          tanggalSuratAsal: decision === "TERIMA" ? tanggalAsal || undefined : undefined,
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

      {existingAccountNote && (
        <div
          className={`rounded-md border px-3 py-2 text-sm ${
            existingAccountNote.tone === "conflict"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {existingAccountNote.message}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {message}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Nomor Surat Asal (untuk surat balasan)
          </label>
          <input
            value={suratAsal}
            onChange={(e) => setSuratAsal(e.target.value)}
            placeholder="mis. 434/I.A2/MG-SI/2026"
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Tanggal Surat Asal
          </label>
          <input
            type="date"
            value={tanggalAsal}
            onChange={(e) => setTanggalAsal(e.target.value)}
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-stone-500">
        Dipakai untuk kalimat &ldquo;Menindaklanjuti surat nomor ... tanggal
        ...&rdquo; pada surat balasan penerimaan. Lengkapi jika belum diisi
        pemohon.
      </p>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Dokumen yang Kurang/Perlu Diperbaiki (jika Perlu Perbaikan)
        </label>
        <div className="flex flex-wrap gap-3">
          {PENGAJUAN_DOCUMENT_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-1.5 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={missingDocs.includes(type)}
                onChange={() => toggleMissingDoc(type)}
                className="rounded border-stone-300"
              />
              {DOCUMENT_TYPE_LABEL[type]}
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-stone-500">
          Dikirim ke pelamar lewat email; pelamar bisa melengkapi berkas ini
          langsung dari halaman Cek Status tanpa perlu mendaftar ulang.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Catatan Internal (opsional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Kategori Alasan (jika menolak)
        </label>
        <select
          value={reasonCategory}
          onChange={(e) => setReasonCategory(e.target.value as "KUOTA_PENUH" | "LAINNYA")}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
        >
          {Object.entries(REJECTION_CATEGORY_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-stone-500">
          &ldquo;Kuota Penuh&rdquo; memberi tahu pelamar bahwa mereka perlu
          mendaftar ulang untuk periode magang berikutnya.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Alasan Penolakan (jika menolak)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => decide("TERIMA")}
          disabled={loading !== null}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
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
