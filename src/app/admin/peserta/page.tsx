import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ApplicationStatusBadge } from "@/components/StatusBadge";

export default async function AdminPesertaPage() {
  const participants = await prisma.user.findMany({
    where: { role: "PESERTA" },
    include: { application: { include: { divisi: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Peserta Magang</h1>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Institusi</th>
              <th className="px-4 py-3 font-medium">Divisi</th>
              <th className="px-4 py-3 font-medium">Periode</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {participants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Belum ada peserta.
                </td>
              </tr>
            )}
            {participants.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/peserta/${p.id}`}
                    className="font-medium text-blue-700 hover:underline"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-slate-400">{p.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {p.application?.institusi}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {p.application?.divisi?.name || "-"}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {p.application &&
                    `${p.application.rencanaMulai.toLocaleDateString("id-ID")} - ${p.application.rencanaSelesai.toLocaleDateString("id-ID")}`}
                </td>
                <td className="px-4 py-3">
                  {p.application && <ApplicationStatusBadge status={p.application.status} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
