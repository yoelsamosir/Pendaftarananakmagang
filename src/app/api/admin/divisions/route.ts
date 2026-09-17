import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const divisions = await prisma.division.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ divisions });
}

export async function POST(req: NextRequest) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name) return NextResponse.json({ error: "Nama divisi wajib diisi" }, { status: 400 });

  const division = await prisma.division.create({ data: { name } });

  await writeAuditLog({
    actorId: guard.session.userId,
    actorEmail: guard.session.email,
    action: "DIVISI_DIBUAT",
    entityType: "Division",
    entityId: division.id,
    after: division,
  });

  return NextResponse.json({ division }, { status: 201 });
}
