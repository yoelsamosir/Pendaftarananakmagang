import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Nama ruangan wajib diisi" }, { status: 400 });
  if (name.length > 100) {
    return NextResponse.json({ error: "Nama ruangan terlalu panjang" }, { status: 400 });
  }

  const before = await prisma.room.findUnique({ where: { id } });
  if (!before) {
    return NextResponse.json({ error: "Ruangan tidak ditemukan" }, { status: 404 });
  }

  const room = await prisma.room.update({ where: { id }, data: { name } });

  await writeAuditLog({
    actorId: guard.session.userId,
    actorEmail: guard.session.email,
    action: "RUANGAN_DIUBAH",
    entityType: "Room",
    entityId: id,
    before,
    after: room,
  });

  return NextResponse.json({ room });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const room = await prisma.room.delete({ where: { id } }).catch(() => null);
  if (!room) {
    return NextResponse.json({ error: "Ruangan tidak ditemukan" }, { status: 404 });
  }

  await writeAuditLog({
    actorId: guard.session.userId,
    actorEmail: guard.session.email,
    action: "RUANGAN_DIHAPUS",
    entityType: "Room",
    entityId: id,
    before: room,
  });

  return NextResponse.json({ ok: true });
}
