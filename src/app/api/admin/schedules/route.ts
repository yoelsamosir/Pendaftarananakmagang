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
  const roomConflict = await prisma.roomSchedule.findFirst({
    where: { roomId, date: parsedDate },
  });
  if (roomConflict) {
    return NextResponse.json(
      { error: "Ruangan sudah digunakan peserta lain pada tanggal tersebut" },
      { status: 409 }
    );
  }

  // Cegah bentrokan sebaliknya: satu peserta tidak boleh dijadwalkan ke dua
  // ruangan berbeda pada tanggal yang sama.
  const userConflict = await prisma.roomSchedule.findFirst({
    where: { userId, date: parsedDate },
    include: { room: true },
  });
  if (userConflict) {
    return NextResponse.json(
      {
        error: `Peserta ini sudah dijadwalkan di ${userConflict.room.name} pada tanggal tersebut`,
      },
      { status: 409 }
    );
  }

  // Pengecekan di atas (findFirst) masih rawan TOCTOU kalau dua request
  // dieksekusi benar-benar bersamaan -- constraint unik di skema (@@unique
  // [roomId, date] & [userId, date]) adalah jaminan akhirnya, ditangkap di sini.
  let schedule;
  try {
    schedule = await prisma.roomSchedule.create({
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
