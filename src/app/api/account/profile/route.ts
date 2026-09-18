import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Belum masuk" }, { status: 401 });
  }
  return NextResponse.json({
    profile: { name: session.name, email: session.email, role: session.role },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Belum masuk" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Data tidak valid" },
      { status: 400 }
    );
  }
  const { name } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { name, role: session.role },
  });
  if (error) {
    return NextResponse.json({ error: "Gagal menyimpan nama" }, { status: 500 });
  }

  await prisma.user.update({ where: { id: session.userId }, data: { name } });

  await writeAuditLog({
    actorId: session.userId,
    actorEmail: session.email,
    action: "PROFIL_DIPERBARUI",
    entityType: "User",
    entityId: session.userId,
    after: { name },
  });

  return NextResponse.json({ ok: true, name });
}
