import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { writeAuditLog } from "@/lib/audit";
import { isPastDate } from "@/lib/time";

const PAST_SCHEDULE_MESSAGE =
  "Jadwal yang tanggalnya sudah lewat tidak bisa diubah/dihapus lagi -- ini sudah menjadi record.";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const existing = await prisma.roomSchedule.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
  }
  if (isPastDate(existing.date)) {
    return NextResponse.json({ error: PAST_SCHEDULE_MESSAGE }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const { roomId, userId, date } = body || {};
  if (!roomId || !userId || !date) {
    return NextResponse.json({ error: "Ruangan, peserta, dan tanggal wajib diisi" }, { status: 400 });
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "Tanggal tidak valid" }, { status: 400 });
  }
  if (isPastDate(parsedDate)) {
    return NextResponse.json(
      { error: "Tidak bisa mengubah jadwal ke tanggal yang sudah lewat" },
      { status: 400 }
    );
  }

  // Cek konflik yang sama seperti POST, tapi kecualikan jadwal ini sendiri.
  const roomConflict = await prisma.roomSchedule.findFirst({
    where: { roomId, date: parsedDate, id: { not: id } },
  });
  if (roomConflict) {
    return NextResponse.json(
      { error: "Ruangan sudah digunakan peserta lain pada tanggal tersebut" },
      { status: 409 }
    );
  }
  const userConflict = await prisma.roomSchedule.findFirst({
    where: { userId, date: parsedDate, id: { not: id } },
    include: { room: true },
  });
  if (userConflict) {
    return NextResponse.json(
      { error: `Peserta ini sudah dijadwalkan di ${userConflict.room.name} pada tanggal tersebut` },
      { status: 409 }
    );
  }

  let schedule;
  try {
    schedule = await prisma.roomSchedule.update({
      where: { id },
      data: { roomId, userId, date: parsedDate },
      include: { room: true, user: true },
    });
  } catch (err) {
    const code = typeof err === "object" && err !== null ? (err as { code?: string }).code : undefined;
    if (code === "P2002") {
      return NextResponse.json(
        { error: "Jadwal ini bentrok dengan jadwal lain yang baru saja dibuat" },
        { status: 409 }
      );
    }
    throw err;
  }

  await writeAuditLog({
    actorId: guard.session.userId,
    actorEmail: guard.session.email,
    action: "JADWAL_DIUBAH",
    entityType: "RoomSchedule",
    entityId: id,
    before: existing,
    after: schedule,
  });

  return NextResponse.json({ schedule });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const existing = await prisma.roomSchedule.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
  }
  if (isPastDate(existing.date)) {
    return NextResponse.json({ error: PAST_SCHEDULE_MESSAGE }, { status: 403 });
  }

  const schedule = await prisma.roomSchedule.delete({ where: { id } });

  await writeAuditLog({
    actorId: guard.session.userId,
    actorEmail: guard.session.email,
    action: "JADWAL_DIHAPUS",
    entityType: "RoomSchedule",
    entityId: id,
    before: schedule,
  });

  return NextResponse.json({ ok: true });
}
