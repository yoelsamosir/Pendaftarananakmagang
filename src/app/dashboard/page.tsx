import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationStatusBadge } from "@/components/StatusBadge";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { application: { include: { divisi: true } } },
  });

  const app = user?.application;
  if (!app) {
    return <p className="text-sm text-slate-500">Data peserta tidak ditemukan.</p>;
  }

  const documentCount = await prisma.document.count({ where: { applicationId: app.id } });
  const scheduleCount = await prisma.roomSchedule.count({ where: { userId: session.userId } });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Halo, {app.namaLengkap}
            </h1>
            <p className="text-sm text-slate-500">{app.institusi}</p>
          </div>
          <ApplicationStatusBadge status={app.status} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <InfoBox label="Divisi / Bagian" value={app.divisi?.name || "Belum ditentukan"} />
          <InfoBox
            label="Periode Magang"
            value={`${app.rencanaMulai.toLocaleDateString("id-ID")} - ${app.rencanaSelesai.toLocaleDateString("id-ID")}`}
          />
          <InfoBox label="Dokumen Tersimpan" value={`${documentCount} dokumen`} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">Jadwal Ruangan</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{scheduleCount}</p>
          <p className="text-sm text-slate-500">jadwal penempatan tercatat</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">Status Penyelesaian</p>
          <p className="mt-1 text-sm text-slate-600">
            {app.status === "DITERIMA"
              ? "Anda dapat mengajukan penyelesaian magang setelah masa magang selesai."
              : "Menunggu status pengajuan diterima."}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
