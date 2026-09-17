import { prisma } from "@/lib/prisma";
import { DOCUMENT_TYPE_LABEL } from "@/lib/constants";

const CATEGORY_LABEL: Record<string, string> = {
  PENGAJUAN: "Dokumen Pengajuan",
  SURAT: "Surat Resmi",
  ADMINISTRASI: "Dokumen Administrasi",
  PENYELESAIAN: "Dokumen Penyelesaian",
};

export default async function AdminDokumenPage() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    include: { application: true },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Dokumen</h1>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Peserta</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Jenis</th>
              <th className="px-4 py-3 font-medium">Tanggal Unggah</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Belum ada dokumen.
                </td>
              </tr>
            )}
            {documents.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800">
                  {d.application?.namaLengkap || "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {CATEGORY_LABEL[d.category] ?? d.category}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {DOCUMENT_TYPE_LABEL[d.type] ?? d.type}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {d.createdAt.toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/api/files/${d.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-blue-700 hover:underline"
                  >
                    Lihat
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
