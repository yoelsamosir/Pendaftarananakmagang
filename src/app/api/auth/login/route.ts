import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
  }

  const role = (data.user.user_metadata?.role as string) || "PESERTA";

  await writeAuditLog({
    actorId: data.user.id,
    actorEmail: data.user.email ?? email,
    action: "LOGIN",
    entityType: "User",
    entityId: data.user.id,
  });

  return NextResponse.json({ role });
}
