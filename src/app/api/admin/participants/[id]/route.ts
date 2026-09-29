import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const participant = await prisma.user.findUnique({
    where: { id },
    include: {
      application: {
        include: { divisi: true, documents: true, letters: true, completionRequests: true },
      },
      roomSchedules: { include: { room: true }, orderBy: { date: "asc" } },
    },
  });

  if (!participant || participant.role !== "PESERTA") {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ participant });
}
