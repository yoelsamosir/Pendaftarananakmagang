import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";

export async function GET() {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  // Hanya peserta yang sedang aktif magang (diterima, belum jadi alumni) --
  // satu-satunya pemanggil saat ini adalah dropdown "Tambah Jadwal" di modul
  // Jadwal, dan hanya peserta aktif yang masuk akal dijadwalkan ruangan.
  const participants = await prisma.user.findMany({
    where: {
      role: "PESERTA",
      application: {
        status: "DITERIMA",
        completionRequests: { none: { status: "DISETUJUI" } },
      },
    },
    include: { application: { include: { divisi: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ participants });
}
