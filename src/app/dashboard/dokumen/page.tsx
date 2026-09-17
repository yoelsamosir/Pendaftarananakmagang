import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DOCUMENT_TYPE_LABEL } from "@/lib/constants";

const CATEGORY_LABEL: Record<string, string> = {
  PENGAJUAN: "Dokumen Pengajuan",
  SURAT: "Surat Resmi",
  ADMINISTRASI: "Dokumen Administrasi",
  PENYELESAIAN: "Dokumen Penyelesaian",
};

export default async function DokumenPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  const documents = user?.applicationId
    ? await prisma.document.findMany({
        where: { applicationId: user.applicationId },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Dokumen & Surat</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pusat dokumen Anda. Surat resmi diterbitkan otomatis oleh sistem.
      </p>

      <div className="mt-6 space-y-3">
        {documents.length === 0 && (
          <p className="text-sm text-slate-400">Belum ada dokumen.</p>
        )}
        {documents.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">
                {DOCUMENT_TYPE_LABEL[d.type] ?? d.fileName}
              </p>
              <p className="text-xs text-slate-400">
                {CATEGORY_LABEL[d.category] ?? d.category} ·{" "}
                {d.createdAt.toLocaleDateString("id-ID")}
              </p>
            </div>
            <a
              href={`/api/files/${d.id}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Lihat / Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
