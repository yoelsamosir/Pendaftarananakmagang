import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";

const alur = [
  "Baca informasi & persyaratan magang di halaman ini",
  "Isi formulir pendaftaran dan unggah dokumen (tanpa perlu membuat akun)",
  "Admin memverifikasi data dan dokumen yang diajukan",
  "Jika diterima, surat balasan/penerimaan magang diterbitkan",
  "Akun peserta dibuat dan tautan setup password dikirim ke email",
  "Peserta login, melengkapi data, dan melihat jadwal ruangan",
  "Pelaksanaan magang sesuai periode yang disepakati",
  "Peserta mengajukan penyelesaian magang setelah masa magang berakhir",
  "Admin memverifikasi pengajuan selesai",
  "Surat keterangan telah selesai magang diterbitkan",
];

const dokumen = [
  { nama: "Surat Izin / Permohonan Magang", status: "WAJIB" },
  { nama: "Proposal Magang", status: "WAJIB" },
  {
    nama: "Pedoman Magang dari Kampus/Sekolah/Instansi",
    status: "OPSIONAL / jika ada",
  },
];

const faq = [
  {
    q: "Apakah saya perlu membuat akun sebelum mendaftar?",
    a: "Tidak. Pada tahap pengajuan awal Anda tidak perlu membuat akun — cukup mengisi formulir dan mengunggah dokumen. Akun akan dibuatkan sistem setelah pengajuan Anda diterima.",
  },
  {
    q: "Bagaimana cara mengetahui status pengajuan saya?",
    a: "Gunakan nomor pengajuan (contoh: MAG-2026-0001) dan email yang didaftarkan pada halaman Cek Status.",
  },
  {
    q: "Bagaimana saya menerima surat penerimaan magang?",
    a: "Surat balasan/penerimaan magang diterbitkan dalam bentuk PDF dan dapat dilihat/diunduh melalui dashboard peserta pada menu Dokumen & Surat. Email hanya digunakan sebagai notifikasi.",
  },
  {
    q: "Dokumen apa yang wajib disiapkan?",
    a: "Surat Izin/Permohonan Magang dan Proposal Magang wajib disiapkan. Pedoman Magang dari kampus/sekolah/instansi bersifat opsional jika tersedia.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <PublicNavbar />

      <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700">
            Program Magang
          </p>
          <h1 className="max-w-3xl text-3xl font-bold text-slate-900 sm:text-4xl">
            Sistem Informasi Manajemen Magang Balai Layanan Perpustakaan
            Pemda DIY
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            Ajukan permohonan magang secara online, pantau status pengajuan,
            dan kelola seluruh dokumen serta jadwal magang Anda dalam satu
            sistem terpadu.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/daftar"
              className="rounded-md bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Ajukan Magang Sekarang
            </Link>
            <Link
              href="/status"
              className="rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cek Status Pengajuan
            </Link>
          </div>
        </div>
      </section>

      <section id="persyaratan" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-xl font-bold text-slate-900">
          Dokumen Persyaratan Pendaftaran
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Dokumen berikut disiapkan pada tahap pengajuan awal. Dokumen lain di
          luar daftar ini tidak ditetapkan wajib tanpa keputusan resmi Balai.
        </p>
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Dokumen</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {dokumen.map((d) => (
                <tr key={d.nama}>
                  <td className="px-4 py-3 text-slate-800">{d.nama}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        d.status === "WAJIB"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="alur" className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-xl font-bold text-slate-900">
            Alur Proses Magang
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {alur.map((step, i) => (
              <li
                key={step}
                className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="faq" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-xl font-bold text-slate-900">
          Pertanyaan yang Sering Diajukan
        </h2>
        <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {faq.map((f) => (
            <details key={f.q} className="group p-4">
              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-800 marker:content-none">
                {f.q}
              </summary>
              <p className="mt-2 text-sm text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer id="kontak" className="border-t border-slate-200 bg-slate-900 text-slate-300">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm sm:px-6">
          <p className="font-semibold text-white">
            Balai Layanan Perpustakaan
          </p>
          <p className="mt-1">
            Dinas Perpustakaan dan Arsip Daerah, Pemerintah Daerah Daerah
            Istimewa Yogyakarta
          </p>
          <p className="mt-4 text-slate-400">
            Untuk pertanyaan seputar pendaftaran magang, silakan hubungi
            bagian administrasi Balai Layanan Perpustakaan pada jam kerja.
          </p>
        </div>
      </footer>
    </div>
  );
}
