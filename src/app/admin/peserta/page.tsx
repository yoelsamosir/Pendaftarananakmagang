import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ApplicationStatusBadge } from "@/components/StatusBadge";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 20;

export default async function AdminPesertaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const [participants, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PESERTA" },
      include: { application: { include: { divisi: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where: { role: "PESERTA" } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h1 className="text-xl font-serif font-bold text-stone-900">Peserta Magang</h1>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-stone-50 text-left text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Institusi</th>
              <th className="px-4 py-3 font-medium">Divisi</th>
              <th className="px-4 py-3 font-medium">Periode</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Akun</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {participants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                  Belum ada peserta.
                </td>
              </tr>
            )}
            {participants.map((p) => (
              <tr key={p.id} className="hover:bg-stone-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/peserta/${p.id}`}
                    className="font-medium text-red-800 hover:underline"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-stone-400">{p.email}</p>
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {p.application?.institusi}
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {p.application?.divisi?.name || "-"}
                </td>
                <td className="px-4 py-3 text-stone-500">
                  {p.application &&
                    `${p.application.rencanaMulai.toLocaleDateString("id-ID")} - ${p.application.rencanaSelesai.toLocaleDateString("id-ID")}`}
                </td>
                <td className="px-4 py-3">
                  {p.application && <ApplicationStatusBadge status={p.application.status} />}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      p.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(p) => (p > 1 ? `/admin/peserta?page=${p}` : "/admin/peserta")}
      />
    </div>
  );
}
