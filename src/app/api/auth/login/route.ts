import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const ip = getClientIp(req);
  const ipOk = await checkRateLimit(`login:ip:${ip}`, 20, 15 * 60 * 1000);
  if (!ipOk) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit." },
      { status: 429 }
    );
  }
  const emailOk = await checkRateLimit(`login:email:${email.toLowerCase()}`, 5, 15 * 60 * 1000);
  if (!emailOk) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan login untuk akun ini. Coba lagi dalam 15 menit." },
      { status: 429 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
  }

  // Role dibaca dari Prisma, bukan user_metadata (lihat lib/auth.ts) — nilai
  // ini hanya dipakai frontend untuk redirect ke dashboard yang tepat, gerbang
  // otorisasi sesungguhnya tetap di getSession()/requireRole().
  const profile = await prisma.user.findUnique({
    where: { id: data.user.id },
    select: { role: true },
  });
  const role = profile?.role || "PESERTA";

  await writeAuditLog({
    actorId: data.user.id,
    actorEmail: data.user.email ?? email,
    action: "LOGIN",
    entityType: "User",
    entityId: data.user.id,
  });

  return NextResponse.json({ role });
}
