import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lengkapiBerkasSchema } from "@/lib/validation";
import { saveUploadedFile, ALLOWED_DOC_TYPES, MAX_FILE_SIZE } from "@/lib/storage";
import { sendNotificationEmail } from "@/lib/email";
import { writeAuditLog } from "@/lib/audit";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { detectDocumentType } from "@/lib/fileSignature";

// Jalur bagi pelamar untuk melengkapi berkas pada pengajuan yang statusnya
// PERLU_PERBAIKAN, tanpa perlu mendaftar ulang — dikunci dengan kombinasi
// nomor pengajuan + email yang sama seperti /api/applications/status.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const ipOk = await checkRateLimit(`lengkapi:ip:${ip}`, 10, 60 * 60 * 1000);
  if (!ipOk) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi dalam 1 jam." },
      { status: 429 }
    );
  }

  const formData = await req.formData();
  const raw = {
    nomor: formData.get("nomor"),
    email: formData.get("email"),
  };
  const parsed = lengkapiBerkasSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const { nomor, email } = parsed.data;

  const application = await prisma.application.findFirst({
    where: { nomorPengajuan: nomor, email: { equals: email.toLowerCase() } },
  });
  if (!application) {
    return NextResponse.json(
      { error: "Pengajuan tidak ditemukan. Periksa kembali nomor dan email." },
      { status: 404 }
    );
  }

  if (application.status !== "PERLU_PERBAIKAN") {
    return NextResponse.json(
      { error: "Pengajuan ini tidak dalam status perlu perbaikan." },
      { status: 409 }
    );
  }

  const fields: { field: string; type: string; label: string }[] = [
    { field: "dokumen_surat_permohonan", type: "SURAT_PERMOHONAN", label: "Surat Izin/Permohonan Magang" },
    { field: "dokumen_proposal", type: "PROPOSAL", label: "Proposal Magang" },
    { field: "dokumen_pedoman", type: "PEDOMAN", label: "Pedoman Magang" },
  ];

  const uploaded: { file: File; type: string }[] = [];
  for (const { field, type, label } of fields) {
    const file = formData.get(field) as File | null;
    if (!file || file.size === 0) continue;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `${label} melebihi ukuran maksimal 5MB` }, { status: 400 });
    }
    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `${label} harus berformat PDF atau Word` }, { status: 400 });
    }
    const detected = await detectDocumentType(file);
    if (!detected) {
      return NextResponse.json({ error: `${label} bukan berkas PDF atau Word yang valid` }, { status: 400 });
    }
    uploaded.push({ file, type });
  }

  if (uploaded.length === 0) {
    return NextResponse.json(
      { error: "Unggah minimal satu berkas untuk melengkapi pengajuan" },
      { status: 400 }
    );
  }

  for (const { file, type } of uploaded) {
    const saved = await saveUploadedFile(file, `pengajuan/${application.id}`);
    await prisma.document.create({
      data: {
        category: "PENGAJUAN",
        type,
        fileName: saved.fileName,
        storedPath: saved.storedPath,
        mimeType: saved.mimeType,
        size: saved.size,
        applicationId: application.id,
      },
    });
  }

  await prisma.application.update({
    where: { id: application.id },
    data: { status: "DIAJUKAN", dokumenPerluDiperbaiki: [] },
  });

  await sendNotificationEmail({
    to: application.email,
    subject: `Berkas Pelengkap Diterima - ${application.nomorPengajuan}`,
    body: `Terima kasih ${application.namaLengkap}, berkas pelengkap untuk pengajuan magang Anda dengan nomor ${application.nomorPengajuan} sudah kami terima dan akan direview ulang oleh admin.`,
    type: "PENGAJUAN_DILENGKAPI",
    applicationId: application.id,
  });

  await writeAuditLog({
    actorEmail: application.email,
    action: "PENGAJUAN_DILENGKAPI",
    entityType: "Application",
    entityId: application.id,
    before: { status: "PERLU_PERBAIKAN" },
    after: { status: "DIAJUKAN", dokumenDilengkapi: uploaded.map((u) => u.type) },
  });

  return NextResponse.json({ ok: true, status: "DIAJUKAN" });
}
