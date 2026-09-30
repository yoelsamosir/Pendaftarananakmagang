export function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Selisih hari (dibulatkan ke atas) dari hari ini ke `date`, dihitung dari
// awal hari supaya tidak terpengaruh jam saat ini (mis. masih "H-3" walau
// sudah lewat tengah hari).
export function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - startOfToday().getTime()) / 86400000);
}

// Jadwal ruangan yang tanggalnya sudah lewat berfungsi sebagai record --
// tidak boleh diubah/dihapus lagi (lihat api/admin/schedules/[id]/route.ts).
export function isPastDate(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getTime() < startOfToday().getTime();
}
