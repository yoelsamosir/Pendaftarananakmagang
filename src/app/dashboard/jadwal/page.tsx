import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function JadwalPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const schedules = await prisma.roomSchedule.findMany({
    where: { userId: session.userId },
    include: { room: true },
    orderBy: { date: "asc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Jadwal Magang</h1>
      <p className="mt-1 text-sm text-slate-500">
        Jadwal penempatan/penggunaan ruangan. Jika admin mengubah jadwal, data
        terbaru akan langsung terlihat di sini.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Hari</th>
              <th className="px-4 py-3 font-medium">Ruangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schedules.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                  Belum ada jadwal penempatan ruangan.
                </td>
              </tr>
            )}
            {schedules.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 text-slate-800">
                  {s.date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {s.date.toLocaleDateString("id-ID", { weekday: "long" })}
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">{s.room.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
