import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { generateNomorSurat } from "@/lib/nomor";
import { generateSuratSelesaiPdf } from "@/lib/pdf";
import { saveGeneratedFile } from "@/lib/storage";
import { sendNotificationEmail } from "@/lib/email";
import { writeAuditLog } from "@/lib/audit";
import { requireAwaitingDecision } from "@/lib/decisionGuard";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;
  const { session } = guard;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const decision = body?.decision as "DISETUJUI" | "PERLU_PERBAIKAN" | "DITOLAK" | undefined;
  const adminNote: string | undefined = body?.adminNote;

  if (!decision) {
    return NextResponse.json({ error: "Keputusan wajib diisi" }, { status: 400 });
  }

  const request = await prisma.completionRequest.findUnique({
    where: { id },
    include: { application: { include: { divisi: true } }, user: true },
  });
  if (!request) {
    return NextResponse.json({ error: "Pengajuan selesai tidak ditemukan" }, { status: 404 });
  }

  const statusGuard = requireAwaitingDecision(request.status, "Pengajuan penyelesaian magang");
  if ("error" in statusGuard) return statusGuard.error;

  await prisma.completionRequest.update({
    where: { id },
    data: { status: decision, adminNote: adminNote || null, decidedAt: new Date() },
  });

  await writeAuditLog({
    actorId: session.userId,
    actorEmail: session.email,
    action: `PENYELESAIAN_${decision}`,
    entityType: "CompletionRequest",
    entityId: id,
    before: { status: request.status },
    after: { status: decision, adminNote },
  });

  if (decision !== "DISETUJUI") {
    await sendNotificationEmail({
      to: request.user.email,
      subject: "Status Pengajuan Selesai Magang",
      body: `Pengajuan selesai magang Anda berstatus ${decision}. ${adminNote ? `Catatan: ${adminNote}` : ""}`,
      type: "PENYELESAIAN_DIPUTUSKAN",
      applicationId: request.applicationId,
    });
    return NextResponse.json({ ok: true, status: decision });
  }

  const nomorSurat = await generateNomorSurat("SELESAI");
  const pdfBuffer = await generateSuratSelesaiPdf({
    nomorSurat,
    tanggal: new Date(),
    namaLengkap: request.application.namaLengkap,
    institusi: request.application.institusi,
    programStudi: request.application.programStudi,
    nimNis: request.application.nimNis,
    divisi: request.application.divisi?.name,
    mulai: request.application.rencanaMulai,
    selesai: request.application.rencanaSelesai,
  });
  const pdfPath = await saveGeneratedFile(
    pdfBuffer,
    `surat/${request.applicationId}`,
    "surat-keterangan-selesai.pdf"
  );

  const letter = await prisma.letter.create({
    data: {
      type: "SELESAI",
      number: nomorSurat,
      applicationId: request.applicationId,
      userId: request.userId,
      pdfPath,
    },
  });

  await prisma.document.create({
    data: {
      category: "PENYELESAIAN",
      type: "SURAT_KETERANGAN_SELESAI",
      fileName: `Surat Keterangan Selesai Magang - ${request.application.namaLengkap}.pdf`,
      storedPath: pdfPath,
      mimeType: "application/pdf",
      size: pdfBuffer.length,
      applicationId: request.applicationId,
      uploadedById: session.userId,
    },
  });

  await sendNotificationEmail({
    to: request.user.email,
    subject: "Surat Keterangan Selesai Magang Tersedia",
    body: `Selamat, pengajuan selesai magang Anda telah disetujui. Surat keterangan telah selesai magang sudah tersedia di menu Dokumen & Surat.`,
    type: "SURAT_SELESAI_TERSEDIA",
    applicationId: request.applicationId,
  });

  return NextResponse.json({ ok: true, status: "DISETUJUI", letterNumber: letter.number });
}
