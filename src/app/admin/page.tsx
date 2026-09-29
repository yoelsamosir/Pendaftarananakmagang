import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getStats() {
  const [
    baru,
    dalamVerifikasi,
    diterima,
    ditolak,
    pesertaAktif,
    pengajuanSelesai,
    emailGagal,
    dokumenTerbaru,
  ] = await Promise.all([
    prisma.application.count({ where: { status: "DIAJUKAN" } }),
    prisma.application.count({ where: { status: "DALAM_VERIFIKASI" } }),
    prisma.application.count({ where: { status: "DITERIMA" } }),
    prisma.application.count({ where: { status: "DITOLAK" } }),
    prisma.user.count({ where: { role: "PESERTA", isActive: true } }),
    prisma.completionRequest.count({ where: { status: "DIAJUKAN" } }),
    prisma.emailLog.count({ where: { status: "FAILED" } }),
    prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { application: true },
    }),
  ]);
  return {
    baru,
    dalamVerifikasi,
    diterima,
    ditolak,
    pesertaAktif,
    pengajuanSelesai,
    emailGagal,
    dokumenTerbaru,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Pengajuan Baru", value: stats.baru, href: "/admin/pengajuan?status=DIAJUKAN" },
    { label: "Dalam Verifikasi", value: stats.dalamVerifikasi, href: "/admin/pengajuan?status=DALAM_VERIFIKASI" },
    { label: "Diterima", value: stats.diterima, href: "/admin/pengajuan?status=DITERIMA" },
    { label: "Ditolak", value: stats.ditolak, href: "/admin/pengajuan?status=DITOLAK" },
    { label: "Peserta Aktif", value: stats.pesertaAktif, href: "/admin/peserta" },
    { label: "Pengajuan Selesai Menunggu", value: stats.pengajuanSelesai, href: "/admin/penyelesaian" },
  ];

  return (
    <div>
      <h1 className="text-xl font-serif font-bold text-stone-900">Dashboard Admin</h1>

      {stats.emailGagal > 0 && (
        <Link
          href="/admin/email-log?status=FAILED"
          className="mt-4 flex items-center justify-between rounded-lg border border-red-300 bg-red-50 p-4 hover:bg-red-100"
        >
          <p className="text-sm font-medium text-red-800">
            {stats.emailGagal} email notifikasi gagal terkirim
          </p>
          <span className="text-xs text-red-700 underline">Lihat Email Log</span>
        </Link>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-lg border border-stone-200 bg-white p-5 hover:border-red-300 hover:shadow-sm"
          >
            <p className="text-2xl font-serif font-bold text-stone-900">{c.value}</p>
            <p className="mt-1 text-sm text-stone-500">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-stone-900">
          Dokumen & Surat Terbaru
        </h2>
        <ul className="mt-3 divide-y divide-stone-100">
          {stats.dokumenTerbaru.length === 0 && (
            <li className="py-3 text-sm text-stone-400">Belum ada dokumen.</li>
          )}
          {stats.dokumenTerbaru.map((d) => (
            <li key={d.id} className="flex items-center justify-between py-3 text-sm">
              <span className="text-stone-700">{d.fileName}</span>
              <span className="text-stone-400">
                {d.application?.namaLengkap} ·{" "}
                {new Date(d.createdAt).toLocaleDateString("id-ID")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
