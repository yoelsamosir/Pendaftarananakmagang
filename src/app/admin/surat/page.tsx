import { prisma } from "@/lib/prisma";

const TYPE_LABEL: Record<string, string> = {
  PENERIMAAN: "Surat Penerimaan / Balasan Permohonan Magang",
  SELESAI: "Surat Keterangan Telah Selesai Magang",
};

export default async function AdminSuratPage() {
  const letters = await prisma.letter.findMany({
    orderBy: { date: "desc" },
    include: { application: true },
  });

  const documents = await prisma.document.findMany({
    where: { storedPath: { in: letters.map((l) => l.pdfPath) } },
  });
  const documentByPath = new Map(documents.map((d) => [d.storedPath, d.id]));

  return (
    <div>
      <h1 className="text-xl font-serif font-bold text-stone-900">Surat</h1>
      <p className="mt-1 text-sm text-stone-500">
        Surat resmi diterbitkan otomatis oleh sistem saat pengajuan diterima
        atau penyelesaian magang disetujui.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-stone-50 text-left text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nomor Surat</th>
              <th className="px-4 py-3 font-medium">Jenis</th>
              <th className="px-4 py-3 font-medium">Peserta</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {letters.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                  Belum ada surat diterbitkan.
                </td>
              </tr>
            )}
            {letters.map((l) => (
              <tr key={l.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-mono text-stone-700">{l.number}</td>
                <td className="px-4 py-3 text-stone-600">{TYPE_LABEL[l.type] ?? l.type}</td>
                <td className="px-4 py-3 text-stone-800">{l.application.namaLengkap}</td>
                <td className="px-4 py-3 text-stone-500">
                  {l.date.toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3 text-right">
                  {documentByPath.has(l.pdfPath) ? (
                    <a
                      href={`/api/files/${documentByPath.get(l.pdfPath)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-emerald-800 hover:underline"
                    >
                      Lihat
                    </a>
                  ) : (
                    <span className="text-stone-300">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
