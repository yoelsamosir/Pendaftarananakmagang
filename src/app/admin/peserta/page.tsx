import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ApplicationStatusBadge } from "@/components/StatusBadge";
import Pagination from "@/components/Pagination";
import { Prisma } from "@prisma/client";

const PAGE_SIZE = 10;

const tabs: { value: "aktif" | "alumni"; label: string }[] = [
  { value: "aktif", label: "Aktif Magang" },
  { value: "alumni", label: "Alumni" },
];

export default async function AdminPesertaPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "alumni" ? "alumni" : "aktif";
  const q = params.q?.trim();
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const where: Prisma.UserWhereInput = {
    role: "PESERTA",
    application:
      tab === "alumni"
        ? { completionRequests: { some: { status: "DISETUJUI" } } }
        : { status: "DITERIMA", completionRequests: { none: { status: "DISETUJUI" } } },
  };
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
      { application: { institusi: { contains: q } } },
      { application: { nomorPengajuan: { contains: q } } },
    ];
  }

  const [participants, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { application: { include: { divisi: true, completionRequests: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (p: number) => {
    const sp = new URLSearchParams();
    if (tab !== "aktif") sp.set("tab", tab);
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/admin/peserta?${qs}` : "/admin/peserta";
  };

  return (
    <div>
      <h1 className="text-xl font-serif font-bold text-stone-900">Peserta Magang</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={t.value === "aktif" ? "/admin/peserta" : `/admin/peserta?tab=${t.value}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              tab === t.value
                ? "bg-red-800 text-white"
                : "bg-white text-stone-600 border border-stone-200"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <form className="mt-4" method="get">
        {tab !== "aktif" && <input type="hidden" name="tab" value={tab} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari nama, email, institusi, atau nomor pengajuan..."
          className="w-full max-w-md rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-stone-50 text-left text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Institusi</th>
              <th className="px-4 py-3 font-medium">Divisi</th>
              <th className="px-4 py-3 font-medium">Periode</th>
              <th className="px-4 py-3 font-medium">{tab === "alumni" ? "Selesai" : "Status"}</th>
              <th className="px-4 py-3 font-medium">Akun</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {participants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                  {tab === "alumni" ? "Belum ada alumni." : "Belum ada peserta aktif."}
                </td>
              </tr>
            )}
            {participants.map((p) => {
              const pendingCompletion = p.application?.completionRequests.find(
                (c) => c.status === "DIAJUKAN"
              );
              const approvedCompletion = p.application?.completionRequests.find(
                (c) => c.status === "DISETUJUI"
              );
              return (
                <tr key={p.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/peserta/${p.id}`}
                      className="font-medium text-red-800 hover:underline"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-stone-400">{p.email}</p>
                    {pendingCompletion && (
                      <span className="mt-1 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                        Perlu direview
                      </span>
                    )}
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
                    {tab === "alumni" ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        Alumni
                        {approvedCompletion?.decidedAt
                          ? ` · ${approvedCompletion.decidedAt.toLocaleDateString("id-ID")}`
                          : ""}
                      </span>
                    ) : (
                      p.application && <ApplicationStatusBadge status={p.application.status} />
                    )}
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
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
