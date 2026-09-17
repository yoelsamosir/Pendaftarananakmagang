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
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      divisi: true,
      documents: true,
      user: true,
      letters: true,
      completionRequests: true,
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ application });
}
