import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import { Prisma } from "@prisma/client";

const statusFilters: { value: "" | "FAILED" | "SENT"; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "FAILED", label: "Gagal" },
  { value: "SENT", label: "Terkirim" },
];

const PAGE_SIZE = 10;

export default async function AdminEmailLogPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || "";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const where: Prisma.EmailLogWhereInput = {};
  if (status) where.status = status;

  const [logs, total] = await Promise.all([
    prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.emailLog.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (p: number) => {
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/admin/email-log?${qs}` : "/admin/email-log";
  };

  return (
    <div>
      <h1 className="text-xl font-serif font-bold text-stone-900">Email Log</h1>
      <p className="mt-1 text-sm text-stone-500">
        Email berfungsi sebagai notifikasi; dokumen utama tetap tersimpan di
        sistem. Email berstatus &quot;Gagal&quot; berarti pengguna tidak
        menerima notifikasi ini secara otomatis (misalnya karena SMTP belum
        dikonfigurasi) &mdash; aksi terkait (pengajuan, keputusan, dst) tetap
        tersimpan seperti biasa.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/email-log?status=${f.value}` : "/admin/email-log"}
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

      <div className="mt-6 space-y-3">
        {logs.length === 0 && (
          <p className="text-sm text-stone-400">Belum ada email tercatat.</p>
        )}
        {logs.map((log) => (
          <div key={log.id} className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="flex items-center gap-2">
                {log.type}
                {log.status === "FAILED" && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700">
                    Gagal
                  </span>
                )}
              </span>
              <span>{log.createdAt.toLocaleString("id-ID")}</span>
            </div>
            <p className="mt-1 text-sm font-medium text-stone-800">{log.subject}</p>
            <p className="text-xs text-stone-500">Kepada: {log.to}</p>
            <p className="mt-2 text-sm text-stone-600">{log.body}</p>
          </div>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
