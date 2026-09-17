import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const guard = await requireRole("PESERTA");
  if ("error" in guard) return guard.error;

  const user = await prisma.user.findUnique({
    where: { id: guard.session.userId },
    include: { application: { include: { divisi: true } } },
  });

  if (!user?.application) {
    return NextResponse.json({ error: "Data peserta tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ user: { name: user.name, email: user.email }, application: user.application });
}

export async function PATCH(req: NextRequest) {
  const guard = await requireRole("PESERTA");
  if ("error" in guard) return guard.error;

  const user = await prisma.user.findUnique({ where: { id: guard.session.userId } });
  if (!user?.applicationId) {
    return NextResponse.json({ error: "Data peserta tidak ditemukan" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

  const allowedFields = [
    "telepon",
    "alamat",
    "fakultas",
    "programStudi",
    "nimNis",
    "semesterKelas",
  ] as const;

  const data: Record<string, string | null> = {};
  for (const field of allowedFields) {
    if (field in body) data[field] = body[field] || null;
  }

  const before = await prisma.application.findUnique({ where: { id: user.applicationId } });

  const updated = await prisma.application.update({
    where: { id: user.applicationId },
    data,
    include: { divisi: true },
  });

  await writeAuditLog({
    actorId: guard.session.userId,
    actorEmail: guard.session.email,
    action: "DATA_PESERTA_DIPERBARUI",
    entityType: "Application",
    entityId: user.applicationId,
    before,
    after: updated,
  });

  return NextResponse.json({ application: updated });
}
