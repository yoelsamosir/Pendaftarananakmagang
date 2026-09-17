import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";

export async function GET() {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const [
    baru,
    dalamVerifikasi,
    diterima,
    ditolak,
    pesertaAktif,
    pengajuanSelesai,
    dokumenTerbaru,
  ] = await Promise.all([
    prisma.application.count({ where: { status: "DIAJUKAN" } }),
    prisma.application.count({ where: { status: "DALAM_VERIFIKASI" } }),
    prisma.application.count({ where: { status: "DITERIMA" } }),
    prisma.application.count({ where: { status: "DITOLAK" } }),
    prisma.user.count({ where: { role: "PESERTA", isActive: true } }),
    prisma.completionRequest.count({ where: { status: "DIAJUKAN" } }),
    prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { application: true },
    }),
  ]);

  return NextResponse.json({
    baru,
    dalamVerifikasi,
    diterima,
    ditolak,
    pesertaAktif,
    pengajuanSelesai,
    dokumenTerbaru,
  });
}
