import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";

export async function GET() {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const participants = await prisma.user.findMany({
    where: { role: "PESERTA" },
    include: { application: { include: { divisi: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ participants });
}
