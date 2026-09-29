import { NextResponse } from "next/server";

// Dipakai oleh endpoint keputusan pengajuan magang & keputusan penyelesaian
// magang — keduanya berbagi aturan yang sama: sebuah entitas hanya boleh
// diputuskan selagi masih berstatus "DIAJUKAN" (menunggu keputusan pertama).
// Tanpa penjagaan ini, memanggil endpoint keputusan dua kali (double-klik,
// refresh, request yang diulang) pada entitas yang sudah diputuskan akan
// membuat surat/akun/email duplikat, atau menurunkan status yang sudah final.
export function requireAwaitingDecision(
  currentStatus: string,
  entityLabel: string
): { error: NextResponse } | { ok: true } {
  if (currentStatus !== "DIAJUKAN") {
    return {
      error: NextResponse.json(
        {
          error: `${entityLabel} ini sudah diputuskan sebelumnya (status saat ini: ${currentStatus}) dan tidak bisa diputuskan ulang.`,
        },
        { status: 409 }
      ),
    };
  }
  return { ok: true };
}
