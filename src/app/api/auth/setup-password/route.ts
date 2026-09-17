import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { setupPasswordSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token tidak valid" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { setupToken: token } });
  if (
    !user ||
    !user.setupTokenExpires ||
    user.setupTokenExpires.getTime() < Date.now()
  ) {
    return NextResponse.json(
      { error: "Tautan sudah kedaluwarsa atau tidak valid" },
      { status: 400 }
    );
  }
  return NextResponse.json({ email: user.email, name: user.name });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = setupPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Data tidak valid" },
      { status: 400 }
    );
  }
  const { token, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { setupToken: token } });
  if (
    !user ||
    !user.setupTokenExpires ||
    user.setupTokenExpires.getTime() < Date.now()
  ) {
    return NextResponse.json(
      { error: "Tautan sudah kedaluwarsa atau tidak valid" },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, setupToken: null, setupTokenExpires: null },
  });

  await writeAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    action: "SETUP_PASSWORD",
    entityType: "User",
    entityId: user.id,
  });

  return NextResponse.json({ ok: true });
}
