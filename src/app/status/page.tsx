"use client";

import { FormEvent, useState } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import { ApplicationStatusBadge } from "@/components/StatusBadge";
import { DOCUMENT_TYPE_LABEL, PENGAJUAN_DOCUMENT_TYPES } from "@/lib/constants";

type ApplicationStatusResult = {
  nomorPengajuan: string;
  namaLengkap: string;
  status: string;
  institusi: string;
  rencanaMulai: string;
  rencanaSelesai: string;
  alasanTolak: string | null;
  alasanTolakKategori: string | null;
  catatanAdmin: string | null;
  dokumenPerluDiperbaiki: string[];
  createdAt: string;
  updatedAt: string;
};

export default function StatusPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApplicationStatusResult | null>(null);
  const [nomor, setNomor] = useState("");
  const [email, setEmail] = useState("");

  const [lengkapiLoading, setLengkapiLoading] = useState(false);
  const [lengkapiError, setLengkapiError] = useState<string | null>(null);
  const [lengkapiDone, setLengkapiDone] = useState(false);

  async function lookupStatus(n: string, em: string) {
    setError(null);
    setData(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({ nomor: n, email: em });
      const res = await fetch(`/api/applications/status?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Terjadi kesalahan");
      setData(json.application);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const n = String(formData.get("nomor") || "");
    const em = String(formData.get("email") || "");
    setNomor(n);
    setEmail(em);
    setLengkapiDone(false);
    await lookupStatus(n, em);
  }

  async function handleLengkapiSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLengkapiError(null);
    setLengkapiLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("nomor", nomor);
    formData.set("email", email);
    try {
      const res = await fetch("/api/applications/status/lengkapi", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengirim berkas");
      setLengkapiDone(true);
      await lookupStatus(nomor, email);
    } catch (err) {
      setLengkapiError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLengkapiLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <PublicNavbar />
      <div className="mx-auto w-full max-w-xl px-4 py-14 sm:px-6">
        <h1 className="text-2xl font-serif font-bold text-stone-900">
          Cek Status Pengajuan
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Masukkan nomor pengajuan dan email yang Anda gunakan saat mendaftar.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Nomor Pengajuan
            </label>
            <input
              name="nomor"
              required
              placeholder="MAG-2026-0001"
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-red-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-900 disabled:opacity-60"
          >
            {loading ? "Memeriksa..." : "Cek Status"}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {data && (
          <div className="mt-8 rounded-lg border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm text-stone-500">
                {data.nomorPengajuan}
              </p>
              <ApplicationStatusBadge status={data.status} />
            </div>
            <p className="mt-3 text-lg font-semibold text-stone-900">
              {data.namaLengkap}
            </p>
            <p className="text-sm text-stone-600">{data.institusi}</p>
            <p className="mt-2 text-sm text-stone-500">
              Periode rencana: {new Date(data.rencanaMulai).toLocaleDateString("id-ID")}{" "}
              s.d. {new Date(data.rencanaSelesai).toLocaleDateString("id-ID")}
            </p>

            {data.status === "DITOLAK" && data.alasanTolakKategori === "KUOTA_PENUH" && (
              <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                Mohon maaf, kuota/posisi magang untuk periode ini sudah penuh.
                Anda dapat mendaftar kembali untuk periode magang berikutnya.
              </p>
            )}
            {data.status === "DITOLAK" && data.alasanTolakKategori !== "KUOTA_PENUH" && data.alasanTolak && (
              <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                Alasan: {data.alasanTolak}
              </p>
            )}
            {data.status === "DITERIMA" && (
              <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                Selamat! Pengajuan Anda diterima. Silakan periksa email untuk
                informasi setup akun.
              </p>
            )}

            {data.status === "PERLU_PERBAIKAN" && !lengkapiDone && (
              <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm font-medium text-orange-800">
                  Pengajuan Anda perlu dilengkapi. Anda TIDAK perlu mendaftar
                  ulang — unggah berkas berikut untuk melanjutkan:
                </p>
                {data.dokumenPerluDiperbaiki.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-sm text-orange-800">
                    {data.dokumenPerluDiperbaiki.map((t) => (
                      <li key={t}>{DOCUMENT_TYPE_LABEL[t] ?? t}</li>
                    ))}
                  </ul>
                )}
                {data.catatanAdmin && (
                  <p className="mt-2 text-sm text-orange-800">
                    Catatan admin: {data.catatanAdmin}
                  </p>
                )}

                <form onSubmit={handleLengkapiSubmit} className="mt-4 space-y-3">
                  {PENGAJUAN_DOCUMENT_TYPES.map((type) => {
                    const fieldMap: Record<string, string> = {
                      SURAT_PERMOHONAN: "dokumen_surat_permohonan",
                      PROPOSAL: "dokumen_proposal",
                      PEDOMAN: "dokumen_pedoman",
                    };
                    return (
                      <div key={type}>
                        <label className="mb-1 block text-sm font-medium text-stone-700">
                          {DOCUMENT_TYPE_LABEL[type]}
                          {data.dokumenPerluDiperbaiki.includes(type) ? " (kurang)" : " (opsional)"}
                        </label>
                        <input
                          name={fieldMap[type]}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
                        />
                      </div>
                    );
                  })}

                  {lengkapiError && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {lengkapiError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={lengkapiLoading}
                    className="w-full rounded-md bg-red-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-900 disabled:opacity-60"
                  >
                    {lengkapiLoading ? "Mengirim..." : "Kirim Berkas Pelengkap"}
                  </button>
                </form>
              </div>
            )}

            {lengkapiDone && (
              <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Berkas pelengkap sudah dikirim. Pengajuan Anda akan direview
                ulang oleh admin.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
