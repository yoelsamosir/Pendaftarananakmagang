import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ApplicationStatusBadge } from "@/components/StatusBadge";
import ApplicationReviewGate from "./ApplicationReviewGate";

export default async function AdminPengajuanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await prisma.application.findUnique({
    where: { id },
    include: { divisi: true, documents: true, letters: true, user: true },
  });

  if (!application) notFound();

  // Cek dulu apakah email pemohon sudah dipakai akun lain, supaya admin bisa
  // diperingatkan SEBELUM klik "Terima" (decision route menolak reuse akun
  // non-PESERTA, dan reuse akun PESERTA lama tetap diizinkan tapi perlu
  // disadari admin — lihat DecisionPanel & QA findings bug #7).
  let existingAccountNote: { tone: "conflict" | "info"; message: string } | null = null;
  if (application.status === "DIAJUKAN") {
    const existingProfile = await prisma.user.findUnique({
      where: { email: application.email },
    });
    if (existingProfile && existingProfile.role !== "PESERTA") {
      existingAccountNote = {
        tone: "conflict",
        message: `Email ini sudah terdaftar sebagai akun ${existingProfile.role} di sistem. Menerima pengajuan ini akan DITOLAK otomatis oleh sistem sampai konfliknya diselesaikan (misalnya minta pemohon memakai email lain).`,
      };
    } else if (existingProfile && existingProfile.applicationId && existingProfile.applicationId !== id) {
      existingAccountNote = {
        tone: "conflict",
        message: "Email ini sudah terdaftar pada akun peserta lain (terhubung ke pengajuan berbeda).",
      };
    } else if (existingProfile) {
      existingAccountNote = {
        tone: "info",
        message: `Email ini sudah punya akun peserta dari pengajuan sebelumnya (belum terhubung ke pengajuan manapun saat ini). Menerima pengajuan ini akan memakai ulang akun tersebut, bukan membuat akun baru.`,
      };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm text-stone-500">
              {application.nomorPengajuan}
            </p>
            <ApplicationStatusBadge status={application.status} />
          </div>
          <h1 className="mt-2 text-xl font-serif font-bold text-stone-900">
            {application.namaLengkap}
          </h1>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Section title="Data Pribadi">
              <Field label="Email" value={application.email} />
              <Field label="Telepon" value={application.telepon} />
              <Field label="Alamat" value={application.alamat} />
              <Field
                label="Tanggal Lahir"
                value={
                  application.tanggalLahir
                    ? application.tanggalLahir.toLocaleDateString("id-ID")
                    : null
                }
              />
            </Section>
            <Section title="Data Pendidikan">
              <Field label="Institusi" value={application.institusi} />
              <Field label="Fakultas" value={application.fakultas} />
              <Field label="Program Studi" value={application.programStudi} />
              <Field label="NIM / NIS" value={application.nimNis} />
              <Field label="Semester / Kelas" value={application.semesterKelas} />
            </Section>
            <Section title="Data Magang">
              <Field label="Jenis Magang" value={application.jenisMagang} />
              <Field label="Divisi" value={application.divisi?.name} />
              <Field
                label="Rencana Mulai"
                value={application.rencanaMulai.toLocaleDateString("id-ID")}
              />
              <Field
                label="Rencana Selesai"
                value={application.rencanaSelesai.toLocaleDateString("id-ID")}
              />
              <Field label="Durasi" value={application.durasi} />
              <Field label="Nomor Surat Asal" value={application.nomorSuratAsal} />
              <Field
                label="Tanggal Surat Asal"
                value={
                  application.tanggalSuratAsal
                    ? application.tanggalSuratAsal.toLocaleDateString("id-ID")
                    : null
                }
              />
            </Section>
            <Section title="Catatan Pemohon">
              <p className="text-sm text-stone-700">
                {application.catatan || "-"}
              </p>
            </Section>
            {application.user && (
              <Section title="Akun Peserta">
                <p className="text-sm text-stone-700">
                  <span className="text-stone-400">Email login: </span>
                  {application.user.email}
                </p>
                <p className="text-sm text-stone-700">
                  <span className="text-stone-400">Status: </span>
                  <span
                    className={
                      application.user.isActive ? "text-red-600" : "text-red-600"
                    }
                  >
                    {application.user.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </p>
                <Link
                  href={`/admin/peserta/${application.user.id}`}
                  className="text-sm font-medium text-red-800 hover:underline"
                >
                  Kelola Akun →
                </Link>
              </Section>
            )}
          </div>

          {application.status === "DITOLAK" && application.alasanTolak && (
            <div className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              Alasan penolakan: {application.alasanTolak}
            </div>
          )}
          {application.catatanAdmin && (
            <div className="mt-3 rounded-md bg-stone-50 px-4 py-3 text-sm text-stone-600">
              Catatan admin: {application.catatanAdmin}
            </div>
          )}
        </div>
      </div>

      <ApplicationReviewGate
        documents={application.documents}
        applicationId={application.id}
        status={application.status}
        nomorSuratAsal={application.nomorSuratAsal}
        tanggalSuratAsal={
          application.tanggalSuratAsal
            ? application.tanggalSuratAsal.toISOString().slice(0, 10)
            : null
        }
        existingAccountNote={existingAccountNote}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <p className="text-sm text-stone-700">
      <span className="text-stone-400">{label}: </span>
      {value || "-"}
    </p>
  );
}
