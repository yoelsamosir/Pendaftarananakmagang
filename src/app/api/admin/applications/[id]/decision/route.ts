import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { createAdminClient, findAuthUserByEmail } from "@/lib/supabase/admin";
import { generateNomorSurat } from "@/lib/nomor";
import { generateSuratPenerimaanPdf } from "@/lib/pdf";
import { saveGeneratedFile } from "@/lib/storage";
import { sendNotificationEmail } from "@/lib/email";
import { writeAuditLog } from "@/lib/audit";
import { randomBytes } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;
  const { session } = guard;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const decision = body?.decision as "TERIMA" | "TOLAK" | "PERLU_PERBAIKAN" | undefined;
  const catatanAdmin: string | undefined = body?.catatanAdmin;
  const alasanTolak: string | undefined = body?.alasanTolak;

  if (!decision) {
    return NextResponse.json({ error: "Keputusan wajib diisi" }, { status: 400 });
  }

  const application = await prisma.application.findUnique({
    where: { id },
    include: { divisi: true },
  });
  if (!application) {
    return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
  }

  const beforeStatus = application.status;

  if (decision === "TOLAK") {
    await prisma.application.update({
      where: { id },
      data: {
        status: "DITOLAK",
        alasanTolak: alasanTolak || null,
        catatanAdmin: catatanAdmin || null,
        decidedAt: new Date(),
        decidedById: session.userId,
      },
    });

    await sendNotificationEmail({
      to: application.email,
      subject: `Status Pengajuan Magang - ${application.nomorPengajuan}`,
      body: `Mohon maaf, pengajuan magang Anda dengan nomor ${application.nomorPengajuan} belum dapat kami terima. ${
        alasanTolak ? `Alasan: ${alasanTolak}` : ""
      }`,
      type: "PENGAJUAN_DITOLAK",
      applicationId: application.id,
    });

    await writeAuditLog({
      actorId: session.userId,
      actorEmail: session.email,
      action: "PENGAJUAN_DITOLAK",
      entityType: "Application",
      entityId: id,
      before: { status: beforeStatus },
      after: { status: "DITOLAK", alasanTolak },
    });

    return NextResponse.json({ ok: true, status: "DITOLAK" });
  }

  if (decision === "PERLU_PERBAIKAN") {
    await prisma.application.update({
      where: { id },
      data: {
        status: "PERLU_PERBAIKAN",
        catatanAdmin: catatanAdmin || null,
        decidedAt: new Date(),
        decidedById: session.userId,
      },
    });

    await sendNotificationEmail({
      to: application.email,
      subject: `Perlu Perbaikan Pengajuan Magang - ${application.nomorPengajuan}`,
      body: `Pengajuan magang Anda dengan nomor ${application.nomorPengajuan} memerlukan perbaikan. ${
        catatanAdmin ? `Catatan: ${catatanAdmin}` : ""
      }`,
      type: "PENGAJUAN_PERLU_PERBAIKAN",
      applicationId: application.id,
    });

    await writeAuditLog({
      actorId: session.userId,
      actorEmail: session.email,
      action: "PENGAJUAN_PERLU_PERBAIKAN",
      entityType: "Application",
      entityId: id,
      before: { status: beforeStatus },
      after: { status: "PERLU_PERBAIKAN", catatanAdmin },
    });

    return NextResponse.json({ ok: true, status: "PERLU_PERBAIKAN" });
  }

  // TERIMA
  const existingProfile = await prisma.user.findUnique({
    where: { email: application.email },
  });
  if (existingProfile && existingProfile.applicationId && existingProfile.applicationId !== id) {
    return NextResponse.json(
      { error: "Email ini sudah terdaftar pada akun peserta lain" },
      { status: 409 }
    );
  }

  const supabaseAdmin = createAdminClient();

  let authUserId = existingProfile?.id;
  if (!authUserId) {
    const existingAuthUser = await findAuthUserByEmail(supabaseAdmin, application.email);
    if (existingAuthUser) {
      authUserId = existingAuthUser.id;
    } else {
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: application.email,
        password: randomBytes(24).toString("hex"),
        email_confirm: true,
        user_metadata: { name: application.namaLengkap, role: "PESERTA" },
      });
      if (createError || !created.user) {
        return NextResponse.json(
          { error: `Gagal membuat akun peserta: ${createError?.message}` },
          { status: 500 }
        );
      }
      authUserId = created.user.id;
    }
  }

  // Link recovery Supabase Auth dipakai sebagai token setup password sekali pakai.
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email: application.email,
  });
  if (linkError || !linkData.properties?.hashed_token) {
    return NextResponse.json(
      { error: `Gagal membuat tautan setup password: ${linkError?.message}` },
      { status: 500 }
    );
  }
  const setupToken = linkData.properties.hashed_token;

  const user = existingProfile
    ? await prisma.user.update({
        where: { id: existingProfile.id },
        data: { applicationId: id, name: application.namaLengkap, isActive: true },
      })
    : await prisma.user.create({
        data: {
          id: authUserId,
          email: application.email,
          name: application.namaLengkap,
          role: "PESERTA",
          applicationId: id,
        },
      });

  await prisma.application.update({
    where: { id },
    data: {
      status: "DITERIMA",
      catatanAdmin: catatanAdmin || null,
      decidedAt: new Date(),
      decidedById: session.userId,
      userId: user.id,
    },
  });

  const nomorSurat = await generateNomorSurat("PENERIMAAN");
  const pdfBuffer = await generateSuratPenerimaanPdf({
    nomorSurat,
    tanggal: new Date(),
    namaLengkap: application.namaLengkap,
    institusi: application.institusi,
    programStudi: application.programStudi,
    nimNis: application.nimNis,
    divisi: application.divisi?.name,
    rencanaMulai: application.rencanaMulai,
    rencanaSelesai: application.rencanaSelesai,
  });
  const pdfPath = await saveGeneratedFile(
    pdfBuffer,
    `surat/${id}`,
    "surat-penerimaan.pdf"
  );

  const letter = await prisma.letter.create({
    data: {
      type: "PENERIMAAN",
      number: nomorSurat,
      applicationId: id,
      userId: user.id,
      pdfPath,
    },
  });

  await prisma.document.create({
    data: {
      category: "SURAT",
      type: "SURAT_PENERIMAAN",
      fileName: `Surat Penerimaan Magang - ${application.namaLengkap}.pdf`,
      storedPath: pdfPath,
      mimeType: "application/pdf",
      size: pdfBuffer.length,
      applicationId: id,
      uploadedById: session.userId,
    },
  });

  const setupUrl = `/setup-password?token=${setupToken}`;

  await sendNotificationEmail({
    to: application.email,
    subject: `Selamat! Pengajuan Magang Diterima - ${application.nomorPengajuan}`,
    body: `Selamat ${application.namaLengkap}, pengajuan magang Anda telah DITERIMA. Surat penerimaan sudah tersedia di dashboard. Akun Anda telah dibuat, silakan atur password melalui tautan berikut: ${setupUrl}`,
    type: "PENGAJUAN_DITERIMA",
    applicationId: application.id,
  });

  await writeAuditLog({
    actorId: session.userId,
    actorEmail: session.email,
    action: "PENGAJUAN_DITERIMA",
    entityType: "Application",
    entityId: id,
    before: { status: beforeStatus },
    after: { status: "DITERIMA", nomorSurat },
  });

  return NextResponse.json({
    ok: true,
    status: "DITERIMA",
    letterNumber: letter.number,
    setupUrl,
  });
}
