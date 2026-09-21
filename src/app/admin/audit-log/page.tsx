import { prisma } from "@/lib/prisma";

export default async function AdminAuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { actor: true },
  });

  return (
    <div>
      <h1 className="text-xl font-serif font-bold text-stone-900">Audit Log</h1>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-stone-50 text-left text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Waktu</th>
              <th className="px-4 py-3 font-medium">Aktor</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
              <th className="px-4 py-3 font-medium">Entitas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-stone-400">
                  Belum ada aktivitas tercatat.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3 text-stone-500">
                  {log.createdAt.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3 text-stone-700">
                  {log.actor?.name || log.actorEmail || "Sistem"}
                </td>
                <td className="px-4 py-3 font-medium text-stone-800">{log.action}</td>
                <td className="px-4 py-3 text-stone-500">
                  {log.entityType}
                  {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
