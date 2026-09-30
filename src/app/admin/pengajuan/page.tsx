import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ApplicationStatusBadge } from "@/components/StatusBadge";
import Pagination from "@/components/Pagination";
import { Prisma, ApplicationStatus } from "@prisma/client";

const statusFilters: { value: ApplicationStatus | ""; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "DIAJUKAN", label: "Diajukan" },
  { value: "DALAM_VERIFIKASI", label: "Dalam Verifikasi" },
  { value: "PERLU_PERBAIKAN", label: "Perlu Perbaikan" },
  { value: "DITERIMA", label: "Diterima" },
  { value: "DITOLAK", label: "Ditolak" },
];

const PAGE_SIZE = 10;

export default async function AdminPengajuanPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || "";
  const q = params.q?.trim();
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const where: Prisma.ApplicationWhereInput = {};
  if (status) where.status = status as ApplicationStatus;
  if (q) {
    where.OR = [
      { namaLengkap: { contains: q } },
      { nomorPengajuan: { contains: q } },
      { email: { contains: q } },
      { institusi: { contains: q } },
    ];
  }

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { divisi: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.application.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (p: number) => {
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/admin/pengajuan?${qs}` : "/admin/pengajuan";
  };

  return (
    <div>
      <h1 className="text-xl font-serif font-bold text-stone-900">Pengajuan Magang</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/pengajuan?status=${f.value}` : "/admin/pengajuan"}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              status === f.value
                ? "bg-red-800 text-white"
                : "bg-white text-stone-600 border border-stone-200"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <form className="mt-4" method="get">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari nama, nomor pengajuan, email, atau institusi..."
          className="w-full max-w-md rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-stone-50 text-left text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nomor</th>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Institusi</th>
              <th className="px-4 py-3 font-medium">Periode</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {applications.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                  Tidak ada pengajuan.
                </td>
              </tr>
            )}
            {applications.map((a) => (
              <tr key={a.id} className="hover:bg-stone-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/pengajuan/${a.id}`}
                    className="font-mono text-red-800 hover:underline"
                  >
                    {a.nomorPengajuan}
                  </Link>
                </td>
                <td className="px-4 py-3 text-stone-800">{a.namaLengkap}</td>
                <td className="px-4 py-3 text-stone-600">{a.institusi}</td>
                <td className="px-4 py-3 text-stone-500">
                  {a.rencanaMulai.toLocaleDateString("id-ID")} - {a.rencanaSelesai.toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <ApplicationStatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/pengajuan/${a.id}`}
                    className="font-medium text-red-800 hover:underline"
                  >
                    Lihat
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
