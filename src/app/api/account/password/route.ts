import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseJs } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rateLimit";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Belum masuk" }, { status: 401 });
  }

  // Verifikasi currentPassword di bawah pada dasarnya adalah percobaan login
  // — kalau sesi pengguna dibajak (XSS, cookie bocor) tanpa tahu password
  // aslinya, endpoint ini bisa dipakai untuk brute-force. Dibatasi sama
  // seperti endpoint auth lain di app ini.
  const ok = await checkRateLimit(`account-password:user:${session.userId}`, 5, 15 * 60 * 1000);
  if (!ok) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Data tidak valid" },
      { status: 400 }
    );
  }
  const { currentPassword, newPassword } = parsed.data;

  // Verifikasi password saat ini lewat client terpisah (tidak menyentuh cookie sesi aktif)
  // agar sesi yang sedang berjalan tidak terganggu selama pengecekan.
  const verifyClient = createSupabaseJs(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { error: verifyError } = await verifyClient.auth.signInWithPassword({
    email: session.email,
    password: currentPassword,
  });
  if (verifyError) {
    return NextResponse.json({ error: "Password saat ini salah" }, { status: 401 });
  }

  const supabase = await createClient();
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) {
    return NextResponse.json(
      { error: "Gagal mengubah password, silakan coba lagi" },
      { status: 500 }
    );
  }

  await writeAuditLog({
    actorId: session.userId,
    actorEmail: session.email,
    action: "GANTI_PASSWORD",
    entityType: "User",
    entityId: session.userId,
  });

  return NextResponse.json({ ok: true });
}
