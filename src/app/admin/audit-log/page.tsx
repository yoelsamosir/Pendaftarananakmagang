import { prisma } from "@/lib/prisma";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 10;

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      include: { actor: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (p: number) => (p > 1 ? `/admin/audit-log?page=${p}` : "/admin/audit-log");

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
              <tr key={log.id} className="hover:bg-stone-50">
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

      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
