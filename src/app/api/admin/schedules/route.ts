import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { sendNotificationEmail } from "@/lib/email";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const schedules = await prisma.roomSchedule.findMany({
    include: { room: true, user: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ schedules });
}

export async function POST(req: NextRequest) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const body = await req.json().catch(() => null);
  const { roomId, userId, date } = body || {};
  if (!roomId || !userId || !date) {
    return NextResponse.json({ error: "Ruangan, peserta, dan tanggal wajib diisi" }, { status: 400 });
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "Tanggal tidak valid" }, { status: 400 });
  }

  // Cegah bentrokan: satu ruangan hanya untuk satu peserta pada tanggal yang sama.
  const conflict = await prisma.roomSchedule.findFirst({
    where: { roomId, date: parsedDate },
  });
  if (conflict) {
    return NextResponse.json(
      { error: "Ruangan sudah digunakan peserta lain pada tanggal tersebut" },
      { status: 409 }
    );
  }

  const schedule = await prisma.roomSchedule.create({
    data: { roomId, userId, date: parsedDate },
    include: { room: true, user: true },
  });

  await sendNotificationEmail({
    to: schedule.user.email,
    subject: "Jadwal Ruangan Magang Diperbarui",
    body: `Jadwal ruangan Anda pada ${parsedDate.toLocaleDateString("id-ID")} telah ditetapkan di ${schedule.room.name}.`,
    type: "JADWAL_DIUBAH",
  });

  await writeAuditLog({
    actorId: guard.session.userId,
    actorEmail: guard.session.email,
    action: "JADWAL_DIBUAT",
    entityType: "RoomSchedule",
    entityId: schedule.id,
    after: schedule,
  });

  return NextResponse.json({ schedule }, { status: 201 });
}
