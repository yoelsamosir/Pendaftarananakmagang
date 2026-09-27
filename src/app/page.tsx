import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import { PEDOMAN_MAGANG_URL } from "@/lib/internshipDocuments";

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

const layananInfo = [
  {
    komponen: "Persyaratan Pelayanan",
    uraian: [
      "Mengirimkan surat izin/permohonan magang dan draft proposal magang (serta pedoman magang dari kampus/sekolah/instansi masing-masing, jika ada).",
      "Surat ditujukan kepada Kepala Balai Layanan Perpustakaan, Gedung Grhatama Pustaka, Jl. Janti, Banguntapan, Bantul.",
      "Pengiriman melalui email balaiyanpus@jogjaprov.go.id atau datang langsung ke Gedung Grhatama Pustaka.",
      "Konfirmasi melalui WhatsApp 0881-2658-192.",
      "Surat dikirim paling lambat 14 hari sebelum pelaksanaan magang.",
    ],
  },
  {
    komponen: "Sistem, Mekanisme, dan Prosedur",
    uraian: [
      "Ajukan permohonan sesuai persyaratan di atas.",
      "Surat diterima paling lambat 7 hari sebelum pelaksanaan magang.",
      "Petugas memproses permohonan magang.",
      "Informasi diterima/tidak diterima disampaikan melalui WhatsApp, paling lambat 3 hari kerja setelah surat diterima.",
      "Pemohon yang diterima selanjutnya dapat menghubungi pendamping magang yang ditunjuk.",
    ],
  },
  {
    komponen: "Jangka Waktu Penyelesaian",
    uraian: ["Proses surat: maksimal 24 jam sejak surat diterima."],
  },
  {
    komponen: "Biaya / Tarif",
    uraian: ["Tidak dipungut biaya (gratis)."],
  },
  {
    komponen: "Produk Pelayanan",
    uraian: ["Layanan Penelitian dan Magang."],
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
    q: "Dokumen apa yang wajib disiapkan saat mendaftar?",
    a: "Surat Izin/Permohonan Magang dan Proposal Magang wajib disiapkan. Pedoman Magang dari kampus/sekolah/instansi bersifat opsional jika tersedia.",
  },
  {
    q: "Bagaimana jika saya tidak mendapat balasan setelah mengirim surat?",
    a: "Konfirmasi status permohonan Anda melalui WhatsApp 0881-2658-192 atau cek langsung di halaman Cek Status pada situs ini.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <PublicNavbar />

      <section className="border-b border-stone-200 bg-gradient-to-b from-red-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-700">
            Layanan Penelitian dan Magang
          </p>
          <h1 className="max-w-3xl text-3xl font-serif font-bold text-stone-900 sm:text-4xl">
            Sistem Informasi Manajemen Magang Balai Layanan Perpustakaan
            Pemda DIY
          </h1>
          <p className="mt-4 max-w-2xl text-stone-600">
            Ajukan permohonan magang secara online, pantau status pengajuan,
            dan kelola seluruh dokumen serta jadwal magang Anda dalam satu
            sistem terpadu.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/daftar"
              className="rounded-md bg-red-800 px-6 py-3 text-sm font-semibold text-white hover:bg-red-900"
            >
              Ajukan Magang Sekarang
            </Link>
            <Link
              href="/status"
              className="rounded-md border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
            >
              Cek Status Pengajuan
            </Link>
          </div>
        </div>
      </section>

      <section id="layanan" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-xl font-serif font-bold text-stone-900">
          Informasi Layanan Penelitian dan Magang
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Ketentuan resmi layanan magang di Balai Layanan Perpustakaan. Isi
          selengkapnya mengikuti Pedoman Magang yang diterbitkan Balai.
        </p>

        <a
          href={PEDOMAN_MAGANG_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-red-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-900"
        >
          📄 Unduh Pedoman Magang 2026 (PDF)
        </a>

        <div className="mt-6 overflow-hidden rounded-lg border border-stone-200">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-stone-200 bg-white">
              {layananInfo.map((row, i) => (
                <tr key={row.komponen} className="align-top">
                  <td className="w-40 shrink-0 bg-stone-50 px-4 py-4 font-medium text-stone-700 sm:w-56">
                    <span className="mr-2 text-amber-700">{i + 1}.</span>
                    {row.komponen}
                  </td>
                  <td className="px-4 py-4 text-stone-700">
                    {row.uraian.length === 1 ? (
                      <p>{row.uraian[0]}</p>
                    ) : (
                      <ul className="list-disc space-y-1.5 pl-4">
                        {row.uraian.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-stone-500">
          Sumber:{" "}
          <a
            href="https://balaiyanpus.jogjaprov.go.id/static/layanan-penelitian-dan-magang"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-red-800 hover:underline"
          >
            Layanan Penelitian dan Magang — balaiyanpus.jogjaprov.go.id
          </a>
        </p>
      </section>

      <section id="persyaratan" className="border-y border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-xl font-serif font-bold text-stone-900">
            Dokumen Persyaratan Pendaftaran
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Dokumen berikut disiapkan pada tahap pengajuan awal. Dokumen lain
            di luar daftar ini tidak ditetapkan wajib tanpa keputusan resmi
            Balai.
          </p>
          <div className="mt-6 overflow-hidden rounded-lg border border-stone-200">
            <table className="w-full text-sm">
              <thead className="bg-stone-100 text-left text-stone-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Dokumen</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white">
                {dokumen.map((d) => (
                  <tr key={d.nama}>
                    <td className="px-4 py-3 text-stone-800">{d.nama}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          d.status === "WAJIB"
                            ? "bg-red-100 text-red-700"
                            : "bg-stone-100 text-stone-600"
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

          <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Dokumen administrasi (formulir, tata tertib, jadwal, log book,
            penilaian) dan desain ID Card baru dapat diunduh peserta yang
            diterima melalui dashboard setelah login.
          </p>
        </div>
      </section>

      <section id="alur" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-xl font-serif font-bold text-stone-900">
          Alur Proses Magang
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {alur.map((step, i) => (
            <li
              key={step}
              className="flex gap-3 rounded-lg border border-stone-200 bg-white p-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-800 text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="text-sm text-stone-700">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section id="faq" className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-xl font-serif font-bold text-stone-900">
            Pertanyaan yang Sering Diajukan
          </h2>
          <div className="mt-6 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
            {faq.map((f) => (
              <details key={f.q} className="group p-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-stone-800 marker:content-none">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm text-stone-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer id="kontak" className="border-t border-stone-200 bg-red-950 text-stone-300">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm sm:px-6">
          <p className="font-serif font-semibold text-white">
            Balai Layanan Perpustakaan
          </p>
          <p className="mt-1">
            Dinas Perpustakaan dan Arsip Daerah, Pemerintah Daerah Daerah
            Istimewa Yogyakarta
          </p>
          <p className="mt-1 text-stone-400">
            Gedung Grhatama Pustaka, Jl. Janti, Banguntapan, Bantul, DIY
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">
                Kontak
              </p>
              <ul className="mt-2 space-y-1 text-stone-300">
                <li>WhatsApp: 0881-2658-192</li>
                <li>Telepon: (0274) 4536233</li>
                <li>Faks: (0274) 4536234</li>
                <li>Email: balaiyanpus@jogjaprov.go.id</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">
                Media Sosial
              </p>
              <ul className="mt-2 space-y-1 text-stone-300">
                <li>Facebook: @balaiyanpus.dpaddiy</li>
                <li>Instagram: @balaiyanpus.dpaddiy</li>
                <li>X (Twitter): @yanpus_dpaddiy</li>
                <li>
                  Website resmi:{" "}
                  <a
                    href="https://balaiyanpus.jogjaprov.go.id"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-300 hover:underline"
                  >
                    balaiyanpus.jogjaprov.go.id
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <p className="mt-6 border-t border-white/10 pt-4 text-xs text-stone-500">
            Sistem pendaftaran magang ini tidak dipungut biaya (gratis). Untuk
            pengaduan, saran, dan masukan, silakan hubungi kontak di atas.
          </p>
        </div>
      </footer>
    </div>
  );
}
