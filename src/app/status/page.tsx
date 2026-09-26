"use client";

import { FormEvent, useState } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import { ApplicationStatusBadge } from "@/components/StatusBadge";

type ApplicationStatusResult = {
  nomorPengajuan: string;
  namaLengkap: string;
  status: string;
  institusi: string;
  rencanaMulai: string;
  rencanaSelesai: string;
  alasanTolak: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function StatusPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApplicationStatusResult | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setData(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams({
      nomor: String(formData.get("nomor") || ""),
      email: String(formData.get("email") || ""),
    });
    try {
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
            {data.status === "DITOLAK" && data.alasanTolak && (
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
          </div>
        )}
      </div>
    </div>
  );
}
