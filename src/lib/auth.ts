import { createClient } from "./supabase/server";

export type SessionPayload = {
  userId: string;
  email: string;
  role: "ADMIN" | "PESERTA";
  name: string;
};

// Dipakai oleh Server Component (layout/page) & Route Handler untuk membaca
// pengguna yang sedang login. Role & nama diambil dari user_metadata Supabase
// Auth (di-set saat akun dibuat), bukan query database terpisah.
export async function getSession(): Promise<SessionPayload | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email) return null;

  const role = (user.user_metadata?.role as "ADMIN" | "PESERTA") || "PESERTA";
  const name = (user.user_metadata?.name as string) || user.email;

  return { userId: user.id, email: user.email, role, name };
}
