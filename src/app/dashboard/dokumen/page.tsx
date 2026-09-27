import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DOCUMENT_TYPE_LABEL } from "@/lib/constants";
import { ID_CARD_CANVA_URL, dokumenAdministrasi } from "@/lib/internshipDocuments";

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
      <h1 className="text-xl font-serif font-bold text-stone-900">Dokumen & Surat</h1>
      <p className="mt-1 text-sm text-stone-500">
        Pusat dokumen Anda. Surat resmi diterbitkan otomatis oleh sistem.
      </p>

      <div className="mt-6 space-y-3">
        {documents.length === 0 && (
          <p className="text-sm text-stone-400">Belum ada dokumen.</p>
        )}
        {documents.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-4"
          >
            <div>
              <p className="text-sm font-medium text-stone-800">
                {DOCUMENT_TYPE_LABEL[d.type] ?? d.fileName}
              </p>
              <p className="text-xs text-stone-400">
                {CATEGORY_LABEL[d.category] ?? d.category} ·{" "}
                {d.createdAt.toLocaleDateString("id-ID")}
              </p>
            </div>
            <a
              href={`/api/files/${d.id}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Lihat / Download
            </a>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-base font-semibold text-stone-900">
        Formulir & Template Administrasi Magang
      </h2>
      <p className="mt-1 text-sm text-stone-500">
        Unduh, isi, dan cetak dokumen berikut sesuai arahan pendamping magang,
        lalu masukkan ke dalam map transparan (snelhecter) warna putih atau
        hitam.
      </p>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium text-stone-800">
              Desain ID Card Magang
            </p>
            <p className="text-xs text-stone-400">Template Canva</p>
          </div>
          <a
            href={ID_CARD_CANVA_URL}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Buka
          </a>
        </div>
        {dokumenAdministrasi.map((d, i) => (
          <div
            key={d.nama}
            className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white p-4"
          >
            <div>
              <p className="text-sm font-medium text-stone-800">
                {d.nama.replace(/^Lampiran \d+\.\s*/, "")}
              </p>
              <p className="text-xs text-stone-400">Lampiran {i + 1}</p>
            </div>
            <a
              href={d.url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Unduh
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
