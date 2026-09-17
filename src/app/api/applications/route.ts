import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applicationSchema } from "@/lib/validation";
import { generateNomorPengajuan } from "@/lib/nomor";
import {
  saveUploadedFile,
  ALLOWED_DOC_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/storage";
import { sendNotificationEmail } from "@/lib/email";
import { writeAuditLog } from "@/lib/audit";
import { INSTANSI_NAME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const raw = Object.fromEntries(formData.entries());
  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const mulai = new Date(data.rencanaMulai);
  const selesai = new Date(data.rencanaSelesai);
  if (Number.isNaN(mulai.getTime()) || Number.isNaN(selesai.getTime())) {
    return NextResponse.json(
      { error: "Format tanggal tidak valid" },
      { status: 400 }
    );
  }
  if (selesai < mulai) {
    return NextResponse.json(
      { error: "Rencana selesai tidak boleh sebelum rencana mulai" },
      { status: 400 }
    );
  }

  const suratPermohonan = formData.get("dokumen_surat_permohonan") as File | null;
  const proposal = formData.get("dokumen_proposal") as File | null;
  const pedoman = formData.get("dokumen_pedoman") as File | null;

  if (!suratPermohonan || suratPermohonan.size === 0) {
    return NextResponse.json(
      { error: "Surat Izin/Permohonan Magang wajib diunggah" },
      { status: 400 }
    );
  }
  if (!proposal || proposal.size === 0) {
    return NextResponse.json(
      { error: "Proposal Magang wajib diunggah" },
      { status: 400 }
    );
  }

  for (const [label, f] of [
    ["Surat Izin/Permohonan Magang", suratPermohonan],
    ["Proposal Magang", proposal],
    ["Pedoman Magang", pedoman],
  ] as const) {
    if (!f || f.size === 0) continue;
    if (f.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `${label} melebihi ukuran maksimal 5MB` },
        { status: 400 }
      );
    }
    if (!ALLOWED_DOC_TYPES.includes(f.type)) {
      return NextResponse.json(
        { error: `${label} harus berformat PDF atau Word` },
        { status: 400 }
      );
    }
  }

  const nomorPengajuan = await generateNomorPengajuan();

  const application = await prisma.application.create({
    data: {
      nomorPengajuan,
      status: "DIAJUKAN",
      namaLengkap: data.namaLengkap,
      email: data.email,
      telepon: data.telepon,
      alamat: data.alamat || null,
      tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
      institusi: data.institusi,
      fakultas: data.fakultas || null,
      programStudi: data.programStudi || null,
      nimNis: data.nimNis || null,
      semesterKelas: data.semesterKelas || null,
      jenisMagang: data.jenisMagang || null,
      rencanaMulai: mulai,
      rencanaSelesai: selesai,
      durasi: data.durasi || null,
      divisiId: data.divisiId || null,
      catatan: data.catatan || null,
    },
  });

  const docs: { file: File; type: string }[] = [
    { file: suratPermohonan, type: "SURAT_PERMOHONAN" },
    { file: proposal, type: "PROPOSAL" },
  ];
  if (pedoman && pedoman.size > 0) docs.push({ file: pedoman, type: "PEDOMAN" });

  for (const d of docs) {
    const saved = await saveUploadedFile(d.file, `pengajuan/${application.id}`);
    await prisma.document.create({
      data: {
        category: "PENGAJUAN",
        type: d.type,
        fileName: saved.fileName,
        storedPath: saved.storedPath,
        mimeType: saved.mimeType,
        size: saved.size,
        applicationId: application.id,
      },
    });
  }

  await writeAuditLog({
    action: "PENGAJUAN_DIBUAT",
    entityType: "Application",
    entityId: application.id,
    after: { nomorPengajuan, namaLengkap: data.namaLengkap },
  });

  await sendNotificationEmail({
    to: data.email,
    subject: `Pengajuan Magang Diterima Sistem - ${nomorPengajuan}`,
    body: `Terima kasih ${data.namaLengkap}, pengajuan magang Anda di ${INSTANSI_NAME} telah kami terima dengan nomor pengajuan ${nomorPengajuan}. Anda dapat memeriksa status pengajuan kapan saja melalui halaman Cek Status pada website kami.`,
    type: "PENGAJUAN_DIBUAT",
    applicationId: application.id,
  });

  return NextResponse.json({ nomorPengajuan, id: application.id }, { status: 201 });
}
