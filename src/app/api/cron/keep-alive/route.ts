import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Dipanggil Vercel Cron setiap hari (lihat vercel.json). Supabase paket gratis
// mem-pause project yang tidak ada aktivitas database ~7 hari, dan selama
// di-pause seluruh situs tidak bisa dipakai -- query ringan ini menjaganya aktif.
// Kalau CRON_SECRET diset di Vercel, Vercel otomatis mengirim header
// `Authorization: Bearer <CRON_SECRET>`; request lain ditolak.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  await prisma.$queryRaw`SELECT 1`;
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
