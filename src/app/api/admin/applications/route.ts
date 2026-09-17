import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { Prisma, ApplicationStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const status = req.nextUrl.searchParams.get("status");
  const q = req.nextUrl.searchParams.get("q")?.trim();

  const where: Prisma.ApplicationWhereInput = {};
  if (status) where.status = status as ApplicationStatus;
  if (q) {
    where.OR = [
      { namaLengkap: { contains: q } },
      { nomorPengajuan: { contains: q } },
      { email: { contains: q } },
      { institusi: { contains: q } },
    ];
  }

  const applications = await prisma.application.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { divisi: true, documents: true },
  });

  return NextResponse.json({ applications });
}
