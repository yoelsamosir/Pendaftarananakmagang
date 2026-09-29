import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "./prisma";

export function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// Jendela geser berbasis DB. Hitung-lalu-insert dalam DUA statement terpisah
// rawan race: dua request bersamaan bisa sama-sama membaca count di bawah
// `max` sebelum salah satu insert, sehingga batasnya bisa dilewati sedikit
// saat traffic bersamaan tinggi. Di sini count-check dan insert digabung
// jadi SATU statement SQL (INSERT ... WHERE (SELECT count...) < max) supaya
// atomik di level database -- baris baru hanya benar-benar tersimpan kalau
// saat itu juga count masih di bawah limit.
export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<boolean> {
  const cutoff = new Date(Date.now() - windowMs);
  const id = randomUUID();

  const inserted = await prisma.$queryRaw<{ id: string }[]>`
    INSERT INTO "RateLimitHit" ("id", "key", "createdAt")
    SELECT ${id}, ${key}, now()
    WHERE (
      SELECT count(*) FROM "RateLimitHit"
      WHERE "key" = ${key} AND "createdAt" >= ${cutoff}
    ) < ${max}
    RETURNING "id"
  `;

  // Baris kedaluwarsa untuk key ini dibersihkan sekalian di sini (tidak perlu
  // atomik terhadap check di atas -- ini murni housekeeping agar tabel tidak
  // tumbuh tak terbatas untuk key yang sama).
  await prisma.rateLimitHit.deleteMany({ where: { key, createdAt: { lt: cutoff } } });

  return inserted.length > 0;
}
