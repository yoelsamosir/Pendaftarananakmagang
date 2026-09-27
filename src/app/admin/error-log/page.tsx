import { prisma } from "@/lib/prisma";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 30;

export default async function AdminErrorLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const [logs, total] = await Promise.all([
    prisma.errorLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.errorLog.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h1 className="text-xl font-serif font-bold text-stone-900">Error Log</h1>
      <p className="mt-1 text-sm text-stone-500">
        Catatan error tak tertangani dari server (route API, halaman) sebagai
        pengganti ringan layanan monitoring eksternal.
      </p>

      <div className="mt-6 space-y-3">
        {logs.length === 0 && (
          <p className="text-sm text-stone-400">
            Belum ada error tercatat. Ini pertanda baik.
          </p>
        )}
        {logs.map((log) => (
          <details
            key={log.id}
            className="group rounded-lg border border-stone-200 bg-white p-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm">
              <span className="min-w-0 flex-1 truncate font-medium text-red-700">
                {log.message}
              </span>
              <span className="shrink-0 text-xs text-stone-400">
                {log.createdAt.toLocaleString("id-ID")}
              </span>
            </summary>
            <p className="mt-2 text-xs text-stone-500">
              {log.method} {log.path}
            </p>
            {log.stack && (
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-stone-50 p-3 text-xs text-stone-600">
                {log.stack}
              </pre>
            )}
          </details>
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(p) => (p > 1 ? `/admin/error-log?page=${p}` : "/admin/error-log")}
      />
    </div>
  );
}
