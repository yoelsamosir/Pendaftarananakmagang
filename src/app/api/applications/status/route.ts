import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const ok = await checkRateLimit(`status:ip:${ip}`, 15, 10 * 60 * 1000);
  if (!ok) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi dalam beberapa menit." },
      { status: 429 }
    );
  }

  const nomor = req.nextUrl.searchParams.get("nomor")?.trim();
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

  if (!nomor || !email) {
    return NextResponse.json(
      { error: "Nomor pengajuan dan email wajib diisi" },
      { status: 400 }
    );
  }

  const application = await prisma.application.findFirst({
    where: { nomorPengajuan: nomor, email: { equals: email } },
    select: {
      nomorPengajuan: true,
      namaLengkap: true,
      status: true,
      institusi: true,
      rencanaMulai: true,
      rencanaSelesai: true,
      alasanTolak: true,
      alasanTolakKategori: true,
      catatanAdmin: true,
      dokumenPerluDiperbaiki: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!application) {
    return NextResponse.json(
      { error: "Pengajuan tidak ditemukan. Periksa kembali nomor dan email." },
      { status: 404 }
    );
  }

  return NextResponse.json({ application });
}
