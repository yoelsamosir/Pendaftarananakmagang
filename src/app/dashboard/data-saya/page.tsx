"use client";

import { FormEvent, useEffect, useState } from "react";

type ApplicationData = {
  namaLengkap: string;
  email: string;
  telepon: string;
  alamat: string | null;
  institusi: string;
  fakultas: string | null;
  programStudi: string | null;
  nimNis: string | null;
  semesterKelas: string | null;
  divisi: { name: string } | null;
};

export default function DataSayaPage() {
  const [data, setData] = useState<ApplicationData | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/participant/me")
      .then((r) => r.json())
      .then((json) => setData(json.application))
      .catch(() => setError("Gagal memuat data"));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    try {
      const res = await fetch("/api/participant/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan");
      setData(json.application);
      setMessage("Data berhasil disimpan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  if (!data) {
    return <p className="text-sm text-slate-500">Memuat data...</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900">Data Saya</h1>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Data Tidak Dapat Diubah
        </h2>
        <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <p>Nama: {data.namaLengkap}</p>
          <p>Email: {data.email}</p>
          <p>Institusi: {data.institusi}</p>
          <p>Divisi: {data.divisi?.name || "Belum ditentukan"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Data yang Dapat Dilengkapi
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nomor Telepon" name="telepon" defaultValue={data.telepon} />
          <Field label="Fakultas" name="fakultas" defaultValue={data.fakultas} />
          <Field label="Program Studi" name="programStudi" defaultValue={data.programStudi} />
          <Field label="NIM / NIS" name="nimNis" defaultValue={data.nimNis} />
          <Field label="Semester / Kelas" name="semesterKelas" defaultValue={data.semesterKelas} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Alamat</label>
          <textarea
            name="alamat"
            defaultValue={data.alamat || ""}
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string | null;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue || ""}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
}
