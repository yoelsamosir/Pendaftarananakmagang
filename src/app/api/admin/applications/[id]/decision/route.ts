import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { createAdminClient, findAuthUserByEmail } from "@/lib/supabase/admin";
import { generateNomorSurat } from "@/lib/nomor";
import { generateSuratPenerimaanPdf } from "@/lib/pdf";
import { saveGeneratedFile } from "@/lib/storage";
import { sendNotificationEmail } from "@/lib/email";
import { writeAuditLog } from "@/lib/audit";
import { requireAwaitingDecision } from "@/lib/decisionGuard";
import { DOCUMENT_TYPE_LABEL, PENGAJUAN_DOCUMENT_TYPES } from "@/lib/constants";
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
  const nomorSuratAsal: string | undefined = body?.nomorSuratAsal;
  const tanggalSuratAsal: string | undefined = body?.tanggalSuratAsal;
  const alasanTolakKategori: "KUOTA_PENUH" | "LAINNYA" =
    body?.alasanTolakKategori === "KUOTA_PENUH" ? "KUOTA_PENUH" : "LAINNYA";
  const dokumenPerluDiperbaiki: string[] = Array.isArray(body?.dokumenPerluDiperbaiki)
    ? body.dokumenPerluDiperbaiki.filter((t: unknown) =>
        (PENGAJUAN_DOCUMENT_TYPES as readonly string[]).includes(t as string)
      )
    : [];

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

  const statusGuard = requireAwaitingDecision(application.status, "Pengajuan");
  if ("error" in statusGuard) return statusGuard.error;

  const beforeStatus = application.status;

  if (decision === "TOLAK") {
    // Klaim atomik: hanya berhasil kalau status MASIH "DIAJUKAN" saat statement
    // ini jalan. requireAwaitingDecision() di atas cuma pre-check cepat (baca
    // lalu bandingkan) yang masih rawan race kalau dua request bersamaan lolos
    // pre-check itu bersama-sama -- updateMany dengan where.status inilah yang
    // benar-benar atomik di level database (hanya satu yang bisa count:1).
    const claim = await prisma.application.updateMany({
      where: { id, status: "DIAJUKAN" },
      data: {
        status: "DITOLAK",
        alasanTolak: alasanTolak || null,
        alasanTolakKategori,
        catatanAdmin: catatanAdmin || null,
        decidedAt: new Date(),
        decidedById: session.userId,
      },
    });
    if (claim.count === 0) {
      return NextResponse.json(
        { error: "Pengajuan ini baru saja diputuskan oleh proses lain." },
        { status: 409 }
      );
    }

    const kuotaMessage =
      "Mohon maaf, kuota/posisi magang untuk periode ini sudah penuh. Anda dapat mendaftar kembali untuk periode magang berikutnya.";
    const genericMessage = `Mohon maaf, pengajuan magang Anda dengan nomor ${application.nomorPengajuan} belum dapat kami terima. ${
      alasanTolak ? `Alasan: ${alasanTolak}` : ""
    }`;

    await sendNotificationEmail({
      to: application.email,
      subject: `Status Pengajuan Magang - ${application.nomorPengajuan}`,
      body: alasanTolakKategori === "KUOTA_PENUH" ? kuotaMessage : genericMessage,
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
      after: { status: "DITOLAK", alasanTolak, alasanTolakKategori },
    });

    return NextResponse.json({ ok: true, status: "DITOLAK" });
  }

  if (decision === "PERLU_PERBAIKAN") {
    const claim = await prisma.application.updateMany({
      where: { id, status: "DIAJUKAN" },
      data: {
        status: "PERLU_PERBAIKAN",
        catatanAdmin: catatanAdmin || null,
        dokumenPerluDiperbaiki,
        decidedAt: new Date(),
        decidedById: session.userId,
      },
    });
    if (claim.count === 0) {
      return NextResponse.json(
        { error: "Pengajuan ini baru saja diputuskan oleh proses lain." },
        { status: 409 }
      );
    }

    const daftarDokumen = dokumenPerluDiperbaiki
      .map((t) => `- ${DOCUMENT_TYPE_LABEL[t] ?? t}`)
      .join("\n");

    await sendNotificationEmail({
      to: application.email,
      subject: `Perlu Perbaikan Pengajuan Magang - ${application.nomorPengajuan}`,
      body: `Pengajuan magang Anda dengan nomor ${application.nomorPengajuan} memerlukan perbaikan. Anda TIDAK perlu mendaftar ulang — cukup lengkapi berkas berikut melalui halaman Cek Status pada website kami:\n${
        daftarDokumen || "(lihat catatan admin di bawah)"
      }${catatanAdmin ? `\n\nCatatan tambahan: ${catatanAdmin}` : ""}`,
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
      after: { status: "PERLU_PERBAIKAN", catatanAdmin, dokumenPerluDiperbaiki },
    });

    return NextResponse.json({ ok: true, status: "PERLU_PERBAIKAN" });
  }

  // TERIMA
  const existingProfile = await prisma.user.findUnique({
    where: { email: application.email },
  });
  // Email pemohon bisa kebetulan sama dengan email akun yang sudah ada di
  // sistem (misalnya akun admin) — akun non-PESERTA tidak boleh pernah dipakai
  // ulang untuk pengajuan magang, apa pun keadaan applicationId-nya, supaya
  // pemohon tidak bisa mengambil alih akun tersebut lewat tautan setup password.
  if (existingProfile && existingProfile.role !== "PESERTA") {
    return NextResponse.json(
      {
        error: `Email ini sudah terdaftar sebagai akun ${existingProfile.role} di sistem dan tidak bisa dipakai untuk akun peserta. Selesaikan konflik ini secara manual (misalnya minta pemohon memakai email lain) sebelum menerima pengajuan ini.`,
      },
      { status: 409 }
    );
  }
  if (existingProfile && existingProfile.applicationId && existingProfile.applicationId !== id) {
    return NextResponse.json(
      { error: "Email ini sudah terdaftar pada akun peserta lain" },
      { status: 409 }
    );
  }

  // Klaim atomik SEBELUM memulai efek samping eksternal (buat akun Supabase,
  // kirim email, dsb) -- kalau dua request TERIMA untuk pengajuan yang sama
  // benar-benar bersamaan, hanya satu yang berhasil mengklaim (count:1); yang
  // lain berhenti di sini sebelum sempat membuat akun/surat duplikat.
  // Statusnya sengaja diset "DALAM_VERIFIKASI" dulu (bukan langsung DITERIMA)
  // supaya kalau proses di bawah gagal di tengah jalan, pengajuan tidak
  // nyangkut sebagai "DITERIMA" tanpa surat/akun lengkap -- admin akan lihat
  // statusnya "Dalam Verifikasi" dan tahu perlu diperiksa manual.
  const claim = await prisma.application.updateMany({
    where: { id, status: "DIAJUKAN" },
    data: { status: "DALAM_VERIFIKASI", decidedById: session.userId },
  });
  if (claim.count === 0) {
    return NextResponse.json(
      { error: "Pengajuan ini baru saja diputuskan oleh proses lain." },
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

  const finalNomorSuratAsal = nomorSuratAsal ?? application.nomorSuratAsal ?? undefined;
  const finalTanggalSuratAsal = tanggalSuratAsal
    ? new Date(tanggalSuratAsal)
    : application.tanggalSuratAsal ?? undefined;

  const nomorSurat = await generateNomorSurat("PENERIMAAN");
  const pdfBuffer = await generateSuratPenerimaanPdf({
    nomorSurat,
    tanggal: new Date(),
    namaLengkap: application.namaLengkap,
    institusi: application.institusi,
    fakultas: application.fakultas,
    programStudi: application.programStudi,
    nimNis: application.nimNis,
    divisi: application.divisi?.name,
    rencanaMulai: application.rencanaMulai,
    rencanaSelesai: application.rencanaSelesai,
    durasi: application.durasi,
    nomorSuratAsal: finalNomorSuratAsal,
    tanggalSuratAsal: finalTanggalSuratAsal,
  });
  const pdfPath = await saveGeneratedFile(
    pdfBuffer,
    `surat/${id}`,
    "surat-penerimaan.pdf"
  );

  // Satu transaksi supaya application (status final), letter, dan document
  // tercatat bersamaan -- kalau salah satu gagal, semuanya batal (tidak ada
  // status DITERIMA yang nyangkut tanpa surat/dokumen tercatat).
  const [, letter] = await prisma.$transaction([
    prisma.application.update({
      where: { id },
      data: {
        status: "DITERIMA",
        catatanAdmin: catatanAdmin || null,
        decidedAt: new Date(),
        decidedById: session.userId,
        userId: user.id,
        nomorSuratAsal: finalNomorSuratAsal || null,
        tanggalSuratAsal: finalTanggalSuratAsal || null,
      },
    }),
    prisma.letter.create({
      data: {
        type: "PENERIMAAN",
        number: nomorSurat,
        applicationId: id,
        userId: user.id,
        pdfPath,
      },
    }),
    prisma.document.create({
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
    }),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const setupUrl = `${siteUrl}/setup-password?token=${setupToken}`;

  await sendNotificationEmail({
    to: application.email,
    subject: `Selamat! Pengajuan Magang Diterima - ${application.nomorPengajuan}`,
    body: `Selamat ${application.namaLengkap}, pengajuan magang Anda telah DITERIMA. Surat penerimaan sudah tersedia di dashboard. Akun Anda telah dibuat, silakan atur password melalui tautan berikut: ${setupUrl}`,
    logBody: `Selamat ${application.namaLengkap}, pengajuan magang Anda telah DITERIMA. Surat penerimaan sudah tersedia di dashboard. Akun Anda telah dibuat, silakan atur password melalui tautan setup password (tidak disimpan di log ini).`,
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
    after: {
      status: "DITERIMA",
      nomorSurat,
      reusedExistingProfile: Boolean(existingProfile),
    },
  });

  return NextResponse.json({
    ok: true,
    status: "DITERIMA",
    letterNumber: letter.number,
    setupUrl,
  });
}
