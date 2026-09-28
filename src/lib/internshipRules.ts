// Aturan bisnis: rencana mulai magang minimal H+7 dari hari pendaftaran,
// supaya admin punya waktu cukup memverifikasi sebelum tanggal mulai dan
// peserta tidak mendaftar terlalu mepet.
export const MIN_DAYS_BEFORE_MULAI = 7;

export function minRencanaMulaiDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + MIN_DAYS_BEFORE_MULAI);
  return d;
}
