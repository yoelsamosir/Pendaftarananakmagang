import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { writeAuditLog } from "@/lib/audit";

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
