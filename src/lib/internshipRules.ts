// Aturan bisnis: rencana mulai magang minimal H+7 dari hari pendaftaran,
// supaya admin punya waktu cukup memverifikasi sebelum tanggal mulai dan
// peserta tidak mendaftar terlalu mepet.
export const MIN_DAYS_BEFORE_MULAI = 7;

// "Hari ini" selalu dihitung dalam WIB, bukan zona waktu mesin -- server
// Vercel berjalan di UTC, jadi tanpa ini pendaftar pukul 00.00-07.00 WIB
// masih dianggap "kemarin" dan bisa memilih tanggal mulai H+6.
const ZONA_WAKTU = "Asia/Jakarta";

function hariIniWib(now: Date): [number, number, number] {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_WAKTU,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .split("-")
    .map(Number);
  return [y, m - 1, d];
}

// Untuk date picker di browser: tengah malam waktu lokal pada tanggal minimal.
export function minRencanaMulaiDate(now = new Date()): Date {
  const [y, m, d] = hariIniWib(now);
  return new Date(y, m, d + MIN_DAYS_BEFORE_MULAI);
}

// Untuk validasi di server: input "yyyy-MM-dd" di-parse `new Date()` sebagai
// tengah malam UTC, jadi pembandingnya juga tengah malam UTC tanggal minimal.
export function minRencanaMulaiUtc(now = new Date()): Date {
  const [y, m, d] = hariIniWib(now);
  return new Date(Date.UTC(y, m, d + MIN_DAYS_BEFORE_MULAI));
}
