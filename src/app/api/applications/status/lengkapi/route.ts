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

  // Selain per-IP di atas, batasi juga per-nomor-pengajuan: endpoint ini
  // MENULIS data (bukan cuma membaca seperti GET /status) hanya berdasarkan
  // nomor+email, dan nomor pengajuan formatnya pendek & berurut (mudah
  // ditebak) -- tanpa ini, satu nomor yang diketahui bisa "diserang" dari
  // banyak IP berbeda untuk mencoba menebak email yang benar.
  const nomorOk = await checkRateLimit(`lengkapi:nomor:${nomor}`, 5, 60 * 60 * 1000);
  if (!nomorOk) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan untuk nomor pengajuan ini. Coba lagi dalam 1 jam." },
      { status: 429 }
    );
  }

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

  // Kalau admin sudah menandai dokumen mana yang kurang (checklist di
  // DecisionPanel), hanya dokumen itu yang diterima di sini, dan SEMUANYA
  // wajib diunggah — supaya pelamar tidak bisa "lolos review ulang" dengan
  // upload dokumen lain yang tidak diminta sementara yang benar-benar kurang
  // tetap belum dilengkapi. Kalau admin belum pernah pakai checklist (data
  // lama, cuma catatan bebas), fallback ke perilaku lama: terima salah satu.
  const flagged = application.dokumenPerluDiperbaiki;
  const relevantFields = flagged.length > 0 ? fields.filter((f) => flagged.includes(f.type)) : fields;

  const uploaded: { file: File; type: string }[] = [];
  for (const { field, type, label } of relevantFields) {
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

  if (flagged.length > 0) {
    const uploadedTypes = new Set(uploaded.map((u) => u.type));
    const missing = flagged.filter((t) => !uploadedTypes.has(t));
    if (missing.length > 0) {
      const labels = missing.map((t) => fields.find((f) => f.type === t)?.label ?? t);
      return NextResponse.json(
        { error: `Masih ada dokumen yang wajib dilengkapi: ${labels.join(", ")}` },
        { status: 400 }
      );
    }
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

  // Klaim atomik, sama seperti endpoint keputusan admin -- cegah dua submit
  // bersamaan dari pelamar yang sama sama-sama lolos dan dobel proses.
  const claim = await prisma.application.updateMany({
    where: { id: application.id, status: "PERLU_PERBAIKAN" },
    data: { status: "DIAJUKAN", dokumenPerluDiperbaiki: [] },
  });
  if (claim.count === 0) {
    return NextResponse.json(
      { error: "Pengajuan ini baru saja diproses. Coba cek status lagi." },
      { status: 409 }
    );
  }

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
