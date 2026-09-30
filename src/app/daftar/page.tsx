"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import DatePickerField from "@/components/DatePickerField";
import { minRencanaMulaiDate, MIN_DAYS_BEFORE_MULAI } from "@/lib/internshipRules";

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
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
            ✓
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Pengajuan Berhasil Dikirim
          </h1>
          <p className="mt-3 text-stone-600">
            Nomor pengajuan Anda adalah
          </p>
          <p className="mt-1 text-2xl font-mono font-bold text-red-800">
            {result.nomorPengajuan}
          </p>
          <p className="mt-3 max-w-md text-sm text-stone-500">
            Simpan nomor ini untuk memeriksa status pengajuan Anda. Notifikasi
            juga akan dikirim ke email yang Anda daftarkan.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/status"
              className="rounded-md bg-red-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-900"
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
          {/* Honeypot anti-bot: disembunyikan dari pengguna asli lewat CSS,
              tidak pakai display:none/hidden agar tidak mudah dideteksi bot. */}
          <div
            aria-hidden="true"
            className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden"
          >
            <label htmlFor="website">Jangan isi kolom ini</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-stone-900">
              1. Data Pribadi
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama Lengkap" name="namaLengkap" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Nomor Telepon" name="telepon" required />
              <DatePickerField
                label="Tanggal Lahir"
                name="tanggalLahir"
                maxDate={new Date()}
              />
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
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Jenis / Kategori Magang
                </label>
                <select
                  name="jenisMagang"
                  defaultValue=""
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
                >
                  <option value="" disabled hidden>
                    Pilih jenis magang
                  </option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="Wajib">Wajib</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Divisi / Bagian (jika sudah diketahui)
                </label>
                <select
                  name="divisiId"
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
                >
                  <option value="">Belum ditentukan</option>
                  {divisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <DatePickerField
                label="Rencana Mulai"
                name="rencanaMulai"
                required
                minDate={minRencanaMulaiDate()}
              />
              <DatePickerField
                label="Rencana Selesai"
                name="rencanaSelesai"
                required
                minDate={new Date()}
              />
              <Field label="Durasi" name="durasi" placeholder="mis. 2 bulan" />
            </div>
            <p className="text-xs text-stone-500">
              Rencana mulai magang minimal {MIN_DAYS_BEFORE_MULAI} hari dari
              hari ini, agar admin memiliki waktu untuk memverifikasi
              pengajuan Anda.
            </p>
            <Field label="Catatan Tambahan" name="catatan" textarea />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-stone-900">
              4. Dokumen
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nomor Surat Permohonan dari Kampus/Sekolah"
                name="nomorSuratAsal"
                placeholder="mis. 434/I.A2/MG-SI/2026"
              />
              <DatePickerField
                label="Tanggal Surat Permohonan"
                name="tanggalSuratAsal"
                maxDate={new Date()}
              />
            </div>
            <p className="-mt-2 text-xs text-stone-500">
              Nomor dan tanggal surat pengantar/permohonan magang yang
              diterbitkan kampus/sekolah Anda (tertera pada surat yang
              diunggah di bawah). Isi jika sudah tersedia — jika belum,
              kolom ini bisa dilengkapi admin saat verifikasi.
            </p>
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
            className="w-full rounded-md bg-red-800 px-6 py-3 text-sm font-semibold text-white hover:bg-red-900 disabled:opacity-60"
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
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
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
        className="block w-full text-sm text-stone-600 file:mr-4 file:rounded-md file:border-0 file:bg-red-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-red-800 hover:file:bg-red-100"
      />
    </div>
  );
}
