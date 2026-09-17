import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ApplicationStatusBadge, CompletionStatusBadge } from "@/components/StatusBadge";
import { DOCUMENT_TYPE_LABEL } from "@/lib/constants";

export default async function AdminPesertaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const participant = await prisma.user.findUnique({
    where: { id },
    include: {
      application: {
        include: { divisi: true, documents: true, letters: true, completionRequests: true },
      },
      roomSchedules: { include: { room: true }, orderBy: { date: "asc" } },
    },
  });

  if (!participant || !participant.application) notFound();
  const app = participant.application;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">{participant.name}</h1>
          <ApplicationStatusBadge status={app.status} />
        </div>
        <p className="text-sm text-slate-500">{participant.email}</p>
        <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <p>Institusi: {app.institusi}</p>
          <p>Program Studi: {app.programStudi || "-"}</p>
          <p>Divisi: {app.divisi?.name || "-"}</p>
          <p>
            Periode: {app.rencanaMulai.toLocaleDateString("id-ID")} -{" "}
            {app.rencanaSelesai.toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Jadwal Ruangan</h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {participant.roomSchedules.length === 0 && (
            <li className="py-3 text-sm text-slate-400">Belum ada jadwal.</li>
          )}
          {participant.roomSchedules.map((s) => (
            <li key={s.id} className="flex justify-between py-2 text-sm">
              <span>{s.date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
              <span className="font-medium">{s.room.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Dokumen & Surat</h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {app.documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between py-3 text-sm">
              <span>{DOCUMENT_TYPE_LABEL[doc.type] ?? doc.type}</span>
              <a
                href={`/api/files/${doc.id}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-blue-700 hover:underline"
              >
                Lihat
              </a>
            </li>
          ))}
          {app.documents.length === 0 && (
            <li className="py-3 text-sm text-slate-400">Belum ada dokumen.</li>
          )}
        </ul>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Pengajuan Selesai Magang</h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {app.completionRequests.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-2 text-sm">
              <span>{c.submittedAt.toLocaleDateString("id-ID")}</span>
              <CompletionStatusBadge status={c.status} />
            </li>
          ))}
          {app.completionRequests.length === 0 && (
            <li className="py-3 text-sm text-slate-400">Belum ada pengajuan selesai.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
