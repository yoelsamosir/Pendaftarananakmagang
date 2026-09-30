// Satu-satunya sumber aturan kekuatan password — dipakai server (lib/validation.ts,
// membangun skema zod dari sini) maupun client (checklist real-time di form setup
// password & ganti password), supaya keduanya tidak mungkin berbeda lagi.
export const PASSWORD_RULES: { test: (password: string) => boolean; message: string }[] = [
  { test: (v) => v.length >= 8, message: "Minimal 8 karakter" },
  { test: (v) => /[a-z]/.test(v), message: "Mengandung huruf kecil" },
  { test: (v) => /[A-Z]/.test(v), message: "Mengandung huruf besar" },
  { test: (v) => /[0-9]/.test(v), message: "Mengandung angka" },
];

export function getUnmetPasswordRules(password: string) {
  return PASSWORD_RULES.filter((rule) => !rule.test(password));
}
