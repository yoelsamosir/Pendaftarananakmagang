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

const MAX_RANGE_DAYS = 180;

export async function POST(req: NextRequest) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const body = await req.json().catch(() => null);
  const { roomId, userId, dateStart, dateEnd } = body || {};
  if (!roomId || !userId || !dateStart) {
    return NextResponse.json(
      { error: "Ruangan, peserta, dan tanggal wajib diisi" },
      { status: 400 }
    );
  }

  const start = new Date(dateStart);
  const end = dateEnd ? new Date(dateEnd) : start;
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return NextResponse.json({ error: "Tanggal tidak valid" }, { status: 400 });
  }
  if (end < start) {
    return NextResponse.json(
      { error: "Tanggal akhir tidak boleh sebelum tanggal awal" },
      { status: 400 }
    );
  }

  const dates: Date[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  if (dates.length > MAX_RANGE_DAYS) {
    return NextResponse.json(
      { error: `Rentang tanggal maksimal ${MAX_RANGE_DAYS} hari sekali input` },
      { status: 400 }
    );
  }

  // Cegah bentrokan: satu ruangan hanya untuk satu peserta pada tanggal yang sama.
  const roomConflicts = await prisma.roomSchedule.findMany({
    where: { roomId, date: { in: dates } },
  });
  if (roomConflicts.length > 0) {
    return NextResponse.json(
      {
        error: `Ruangan sudah digunakan peserta lain pada tanggal: ${roomConflicts
          .map((c) => c.date.toLocaleDateString("id-ID"))
          .join(", ")}`,
      },
      { status: 409 }
    );
  }

  // Cegah bentrokan sebaliknya: satu peserta tidak boleh dijadwalkan ke dua
  // ruangan berbeda pada tanggal yang sama.
  const userConflicts = await prisma.roomSchedule.findMany({
    where: { userId, date: { in: dates } },
    include: { room: true },
  });
  if (userConflicts.length > 0) {
    return NextResponse.json(
      {
        error: `Peserta ini sudah dijadwalkan di ${userConflicts[0].room.name} pada tanggal: ${userConflicts
          .map((c) => c.date.toLocaleDateString("id-ID"))
          .join(", ")}`,
      },
      { status: 409 }
    );
  }

  // Pengecekan di atas (findMany) masih rawan TOCTOU kalau dua request
  // dieksekusi benar-benar bersamaan -- constraint unik di skema (@@unique
  // [roomId, date] & [userId, date]) adalah jaminan akhirnya, ditangkap di sini.
  let created;
  try {
    created = await prisma.$transaction(
      dates.map((date) =>
        prisma.roomSchedule.create({
          data: { roomId, userId, date },
          include: { room: true, user: true },
        })
      )
    );
  } catch (err) {
    const code =
      typeof err === "object" && err !== null ? (err as { code?: string }).code : undefined;
    if (code === "P2002") {
      return NextResponse.json(
        { error: "Jadwal ini bentrok dengan jadwal lain yang baru saja dibuat" },
        { status: 409 }
      );
    }
    throw err;
  }

  const first = created[0];
  const periodeText =
    dates.length > 1
      ? `${start.toLocaleDateString("id-ID")} s.d. ${end.toLocaleDateString("id-ID")}`
      : start.toLocaleDateString("id-ID");
  await sendNotificationEmail({
    to: first.user.email,
    subject: "Jadwal Ruangan Magang Diperbarui",
    body: `Jadwal ruangan Anda pada ${periodeText} telah ditetapkan di ${first.room.name}.`,
    type: "JADWAL_DIUBAH",
  });

  await writeAuditLog({
    actorId: guard.session.userId,
    actorEmail: guard.session.email,
    action: "JADWAL_DIBUAT",
    entityType: "RoomSchedule",
    entityId: first.id,
    after: { roomId, userId, periode: periodeText, jumlahHari: dates.length },
  });

  return NextResponse.json({ schedules: created }, { status: 201 });
}
