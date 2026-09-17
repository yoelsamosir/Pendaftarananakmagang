import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";

export async function GET() {
  const guard = await requireRole("PESERTA");
  if ("error" in guard) return guard.error;

  const user = await prisma.user.findUnique({ where: { id: guard.session.userId } });
  if (!user?.applicationId) {
    return NextResponse.json({ documents: [] });
  }

  const documents = await prisma.document.findMany({
    where: { applicationId: user.applicationId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ documents });
}
