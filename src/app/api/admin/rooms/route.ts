import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const rooms = await prisma.room.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ rooms });
}

export async function POST(req: NextRequest) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name) return NextResponse.json({ error: "Nama ruangan wajib diisi" }, { status: 400 });

  const room = await prisma.room.create({ data: { name } });

  await writeAuditLog({
    actorId: guard.session.userId,
    actorEmail: guard.session.email,
    action: "RUANGAN_DIBUAT",
    entityType: "Room",
    entityId: room.id,
    after: room,
  });

  return NextResponse.json({ room }, { status: 201 });
}
