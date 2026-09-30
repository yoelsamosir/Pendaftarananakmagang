import { prisma } from "@/lib/prisma";
import { DOCUMENT_TYPE_LABEL } from "@/lib/constants";
import Pagination from "@/components/Pagination";
import { Prisma } from "@prisma/client";

const CATEGORY_LABEL: Record<string, string> = {
  PENGAJUAN: "Dokumen Pengajuan",
  SURAT: "Surat Resmi",
  ADMINISTRASI: "Dokumen Administrasi",
  PENYELESAIAN: "Dokumen Penyelesaian",
};

const PAGE_SIZE = 10;

export default async function AdminDokumenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim();
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const where: Prisma.DocumentWhereInput = {};
  if (q) {
    where.OR = [
      { fileName: { contains: q } },
      { application: { namaLengkap: { contains: q } } },
      { application: { nomorPengajuan: { contains: q } } },
    ];
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { application: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.document.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/admin/dokumen?${qs}` : "/admin/dokumen";
  };

  return (
    <div>
      <h1 className="text-xl font-serif font-bold text-stone-900">Dokumen</h1>

      <form className="mt-4" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari nama peserta, nomor pengajuan, atau nama berkas..."
          className="w-full max-w-md rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-stone-50 text-left text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Peserta</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Jenis</th>
              <th className="px-4 py-3 font-medium">Tanggal Unggah</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {documents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                  Tidak ada dokumen.
                </td>
              </tr>
            )}
            {documents.map((d) => (
              <tr key={d.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 text-stone-800">
                  {d.application?.namaLengkap || "-"}
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {CATEGORY_LABEL[d.category] ?? d.category}
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {DOCUMENT_TYPE_LABEL[d.type] ?? d.type}
                </td>
                <td className="px-4 py-3 text-stone-500">
                  {d.createdAt.toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/api/files/${d.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-red-800 hover:underline"
                  >
                    Lihat
                  </a>
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
