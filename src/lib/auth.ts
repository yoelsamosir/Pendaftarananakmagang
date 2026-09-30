import { createClient } from "./supabase/server";
import { prisma } from "./prisma";

export type SessionPayload = {
  userId: string;
  email: string;
  role: "ADMIN" | "PESERTA";
  name: string;
};

// Dipakai oleh Server Component (layout/page) & Route Handler untuk membaca
// pengguna yang sedang login. Role diambil dari Prisma User.role, BUKAN dari
// user_metadata Supabase Auth — user_metadata bisa diubah sendiri oleh
// pengguna yang sudah login lewat supabase.auth.updateUser({data:{...}}),
// jadi tidak boleh dipakai untuk keputusan otorisasi (terbukti: peserta bisa
// eskalasi ke ADMIN lewat panggilan itu). Prisma User.role hanya bisa diubah
// lewat kode server (decision route, seed), tidak terjangkau pengguna.
export async function getSession(): Promise<SessionPayload | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email) return null;

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, name: true },
  });
  if (!profile) return null;

  return { userId: user.id, email: user.email, role: profile.role, name: profile.name };
}
