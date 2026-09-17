import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { sendNotificationEmail } from "@/lib/email";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const guard = await requireRole("PESERTA");
  if ("error" in guard) return guard.error;

  const requests = await prisma.completionRequest.findMany({
    where: { userId: guard.session.userId },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const guard = await requireRole("PESERTA");
  if ("error" in guard) return guard.error;

  const user = await prisma.user.findUnique({
    where: { id: guard.session.userId },
    include: { application: true },
  });

  if (!user?.application || user.application.status !== "DITERIMA") {
    return NextResponse.json(
      { error: "Pengajuan selesai hanya dapat diajukan oleh peserta aktif" },
      { status: 400 }
    );
  }

  const existing = await prisma.completionRequest.findFirst({
    where: {
      userId: user.id,
      status: { in: ["DIAJUKAN", "DISETUJUI"] },
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Anda sudah memiliki pengajuan selesai yang masih diproses atau disetujui" },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => ({}));

  const request = await prisma.completionRequest.create({
    data: {
      applicationId: user.application.id,
      userId: user.id,
      note: body?.note || null,
      status: "DIAJUKAN",
    },
  });

  await sendNotificationEmail({
    to: user.email,
    subject: "Pengajuan Selesai Magang Diterima Sistem",
    body: `Pengajuan selesai magang Anda telah kami terima dan akan diverifikasi oleh admin.`,
    type: "PENYELESAIAN_DIAJUKAN",
    applicationId: user.application.id,
  });

  await writeAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    action: "PENYELESAIAN_DIAJUKAN",
    entityType: "CompletionRequest",
    entityId: request.id,
  });

  return NextResponse.json({ request }, { status: 201 });
}
