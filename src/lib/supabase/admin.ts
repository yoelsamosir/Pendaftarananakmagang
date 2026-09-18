import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client dengan service role key — HANYA dipakai di server (API routes) untuk
// operasi admin: membuat akun peserta, generate link setup password, dan
// akses Supabase Storage secara penuh (bypass RLS). Jangan pernah dikirim ke client.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// supabase-js belum punya "getUserByEmail" langsung — cari lewat listUsers.
// Cukup untuk skala aplikasi ini (jumlah user terbatas).
export async function findAuthUserByEmail(
  supabase: ReturnType<typeof createAdminClient>,
  email: string
) {
  const perPage = 200;
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`Gagal mencari user: ${error.message}`);
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < perPage) break;
  }
  return null;
}
