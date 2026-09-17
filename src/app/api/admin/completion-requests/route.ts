import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";

export async function GET() {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const requests = await prisma.completionRequest.findMany({
    include: { application: { include: { divisi: true } }, user: true },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ requests });
}
