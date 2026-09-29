import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const GENERIC_MESSAGE =
  "Jika email terdaftar di sistem, tautan reset password sudah dikirim.";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();

  // Sama seperti endpoint publik lain (lihat lib/rateLimit.ts): dibatasi per-IP
  // (cegah satu sumber mencoba banyak email berbeda) dan per-email (cegah spam
  // ke satu akun), lewat mekanisme RateLimitHit yang konsisten di seluruh app.
  const ip = getClientIp(req);
  const ipOk = await checkRateLimit(`forgot-password:ip:${ip}`, 10, 15 * 60 * 1000);
  if (!ipOk) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan reset password. Coba lagi dalam 15 menit." },
      { status: 429 }
    );
  }
  const emailOk = await checkRateLimit(`forgot-password:email:${email}`, 1, 2 * 60 * 1000);
  if (!emailOk) {
    return NextResponse.json(
      { error: "Anda baru saja meminta reset password. Coba lagi dalam beberapa menit." },
      { status: 429 }
    );
  }

  // Tidak membocorkan apakah email terdaftar atau tidak — selalu balas sukses generik,
  // hanya proses pengiriman kalau memang ada akunnya.
  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
    });

    if (!error && data.properties?.hashed_token) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const resetUrl = `${siteUrl}/setup-password?token=${data.properties.hashed_token}`;
      const subject = "Reset Password - Sistem Magang Balai Layanan Perpustakaan";
      const text = `Anda (atau seseorang) meminta reset password untuk akun ini. Klik tautan berikut untuk membuat password baru (tautan ini hanya berlaku sekali pakai):\n\n${resetUrl}\n\nJika Anda tidak meminta ini, abaikan email ini — password Anda tidak akan berubah.`;

      let status = "SENT";
      try {
        await sendMail({ to: email, subject, text });
      } catch (err) {
        status = "FAILED";
        console.error("Gagal mengirim email reset password:", err);
      }

      await prisma.emailLog.create({
        data: { to: email, subject, body: text, type: "RESET_PASSWORD", status },
      });
    }
  } catch (err) {
    console.error("Gagal memproses permintaan reset password:", err);
  }

  return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
}
