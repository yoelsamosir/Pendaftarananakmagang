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
  const conflicts = await prisma.roomSchedule.findMany({
    where: { roomId, date: { in: dates } },
  });
  if (conflicts.length > 0) {
    return NextResponse.json(
      {
        error: `Ruangan sudah digunakan peserta lain pada tanggal: ${conflicts
          .map((c) => c.date.toLocaleDateString("id-ID"))
          .join(", ")}`,
      },
      { status: 409 }
    );
  }

  const created = await prisma.$transaction(
    dates.map((date) =>
      prisma.roomSchedule.create({
        data: { roomId, userId, date },
        include: { room: true, user: true },
      })
    )
  );

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
