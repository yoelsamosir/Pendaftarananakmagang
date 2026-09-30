export function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Jadwal ruangan yang tanggalnya sudah lewat berfungsi sebagai record --
// tidak boleh diubah/dihapus lagi (lihat api/admin/schedules/[id]/route.ts).
export function isPastDate(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getTime() < startOfToday().getTime();
}
