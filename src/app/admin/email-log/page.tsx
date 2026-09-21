import { prisma } from "@/lib/prisma";

export default async function AdminEmailLogPage() {
  const logs = await prisma.emailLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="text-xl font-serif font-bold text-stone-900">Email Log</h1>
      <p className="mt-1 text-sm text-stone-500">
        Email berfungsi sebagai notifikasi; dokumen utama tetap tersimpan di
        sistem.
      </p>

      <div className="mt-6 space-y-3">
        {logs.length === 0 && (
          <p className="text-sm text-stone-400">Belum ada email tercatat.</p>
        )}
        {logs.map((log) => (
          <div key={log.id} className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>{log.type}</span>
              <span>{log.createdAt.toLocaleString("id-ID")}</span>
            </div>
            <p className="mt-1 text-sm font-medium text-stone-800">{log.subject}</p>
            <p className="text-xs text-stone-500">Kepada: {log.to}</p>
            <p className="mt-2 text-sm text-stone-600">{log.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
