import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { setupPasswordSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";

// Token di sini adalah `hashed_token` dari Supabase Auth (link recovery yang
// digenerate saat pengajuan diterima) — sekali pakai. verifyOtp memvalidasi
// token sekaligus membuat sesi baru, lalu updateUser mengganti password.
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

  const supabase = await createClient();

  const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: "recovery",
  });

  if (verifyError || !verifyData.user) {
    return NextResponse.json(
      { error: "Tautan sudah kedaluwarsa atau tidak valid" },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) {
    return NextResponse.json(
      { error: "Gagal menyimpan password, silakan coba lagi" },
      { status: 400 }
    );
  }

  await writeAuditLog({
    actorId: verifyData.user.id,
    actorEmail: verifyData.user.email,
    action: "SETUP_PASSWORD",
    entityType: "User",
    entityId: verifyData.user.id,
  });

  const role = (verifyData.user.user_metadata?.role as string) || "PESERTA";

  return NextResponse.json({ ok: true, role });
}
