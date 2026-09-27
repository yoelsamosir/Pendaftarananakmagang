import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";

export async function GET() {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const count = await prisma.application.count({ where: { status: "DIAJUKAN" } });
  return NextResponse.json({ count });
}
