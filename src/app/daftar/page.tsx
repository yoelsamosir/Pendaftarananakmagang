"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";

type Division = { id: string; name: string };

export default function DaftarPage() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ nomorPengajuan: string } | null>(
    null
  );

  useEffect(() => {
    fetch("/api/divisions")
      .then((r) => r.json())
      .then((d) => setDivisions(d.divisions ?? []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal mengirim pengajuan");
      }
      setResult({ nomorPengajuan: json.nomorPengajuan });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="flex min-h-full flex-col">
        <PublicNavbar />
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
            ✓
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Pengajuan Berhasil Dikirim
          </h1>
          <p className="mt-3 text-stone-600">
            Nomor pengajuan Anda adalah
          </p>
          <p className="mt-1 text-2xl font-mono font-bold text-emerald-800">
            {result.nomorPengajuan}
          </p>
          <p className="mt-3 max-w-md text-sm text-stone-500">
            Simpan nomor ini untuk memeriksa status pengajuan Anda. Notifikasi
            juga akan dikirim ke email yang Anda daftarkan.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/status"
              className="rounded-md bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
            >
              Cek Status Pengajuan
            </Link>
            <Link
              href="/"
              className="rounded-md border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <PublicNavbar />
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-serif font-bold text-stone-900">
          Formulir Pendaftaran Magang
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Anda tidak perlu membuat akun untuk mengajukan magang. Akun akan
          dibuatkan sistem apabila pengajuan Anda diterima.
        </p>

        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-10">
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-stone-900">
              1. Data Pribadi
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama Lengkap" name="namaLengkap" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Nomor Telepon" name="telepon" required />
              <Field label="Tanggal Lahir" name="tanggalLahir" type="date" />
            </div>
            <Field label="Alamat" name="alamat" textarea />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-stone-900">
              2. Data Pendidikan
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Kampus / Sekolah / Instansi"
                name="institusi"
                required
              />
              <Field label="Fakultas" name="fakultas" />
              <Field label="Program Studi" name="programStudi" />
              <Field label="NIM / NIS" name="nimNis" />
              <Field label="Semester / Kelas" name="semesterKelas" />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-stone-900">
              3. Data Magang
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Jenis / Kategori Magang" name="jenisMagang" />
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Divisi / Bagian (jika sudah diketahui)
                </label>
                <select
                  name="divisiId"
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                >
                  <option value="">Belum ditentukan</option>
                  {divisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <Field
                label="Rencana Mulai"
                name="rencanaMulai"
                type="date"
                required
              />
              <Field
                label="Rencana Selesai"
                name="rencanaSelesai"
                type="date"
                required
              />
              <Field label="Durasi" name="durasi" placeholder="mis. 2 bulan" />
            </div>
            <Field label="Catatan Tambahan" name="catatan" textarea />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-stone-900">
              4. Dokumen
            </legend>
            <FileField
              label="Surat Izin / Permohonan Magang"
              name="dokumen_surat_permohonan"
              required
            />
            <FileField
              label="Proposal Magang"
              name="dokumen_proposal"
              required
            />
            <FileField
              label="Pedoman Magang dari Kampus/Sekolah/Instansi (opsional)"
              name="dokumen_pedoman"
            />
            <p className="text-xs text-stone-500">
              Format PDF atau Word, maksimal 5MB per dokumen.
            </p>
          </fieldset>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-emerald-800 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
          >
            {submitting ? "Mengirim..." : "Kirim Pengajuan"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  textarea,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
        />
      )}
    </div>
  );
}

function FileField({
  label,
  name,
  required,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type="file"
        name={name}
        required={required}
        accept=".pdf,.doc,.docx"
        className="block w-full text-sm text-stone-600 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-800 hover:file:bg-emerald-100"
      />
    </div>
  );
}
