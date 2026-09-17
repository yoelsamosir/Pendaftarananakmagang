import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";

export async function GET() {
  const guard = await requireRole("PESERTA");
  if ("error" in guard) return guard.error;

  const schedules = await prisma.roomSchedule.findMany({
    where: { userId: guard.session.userId },
    include: { room: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ schedules });
}
