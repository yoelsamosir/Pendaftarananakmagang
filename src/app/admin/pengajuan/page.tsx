import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ApplicationStatusBadge } from "@/components/StatusBadge";
import { Prisma, ApplicationStatus } from "@prisma/client";

const statusFilters: { value: ApplicationStatus | ""; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "DIAJUKAN", label: "Diajukan" },
  { value: "DALAM_VERIFIKASI", label: "Dalam Verifikasi" },
  { value: "PERLU_PERBAIKAN", label: "Perlu Perbaikan" },
  { value: "DITERIMA", label: "Diterima" },
  { value: "DITOLAK", label: "Ditolak" },
];

export default async function AdminPengajuanPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || "";
  const q = params.q?.trim();

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

  const applications = await prisma.application.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { divisi: true },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Pengajuan Magang</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/pengajuan?status=${f.value}` : "/admin/pengajuan"}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              status === f.value
                ? "bg-blue-700 text-white"
                : "bg-white text-slate-600 border border-slate-200"
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
          className="w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nomor</th>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Institusi</th>
              <th className="px-4 py-3 font-medium">Periode</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applications.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Tidak ada pengajuan.
                </td>
              </tr>
            )}
            {applications.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/pengajuan/${a.id}`}
                    className="font-mono text-blue-700 hover:underline"
                  >
                    {a.nomorPengajuan}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-800">{a.namaLengkap}</td>
                <td className="px-4 py-3 text-slate-600">{a.institusi}</td>
                <td className="px-4 py-3 text-slate-500">
                  {a.rencanaMulai.toLocaleDateString("id-ID")} - {a.rencanaSelesai.toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <ApplicationStatusBadge status={a.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
