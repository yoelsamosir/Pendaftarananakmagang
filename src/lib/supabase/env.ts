// Helper kecil supaya kalau env var belum di-set di suatu environment
// (mis. lupa ditambahkan di dashboard Vercel), errornya jelas menyebut nama
// variabelnya — bukan error generik dari dalam @supabase/ssr atau supabase-js.
export function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Environment variable ${name} belum di-set di environment ini.`);
  }
  return value;
}
