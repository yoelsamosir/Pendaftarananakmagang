import { NextRequest } from "next/server";
import { prisma } from "./prisma";

export function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// Jendela geser berbasis DB: mengizinkan maksimal `max` hit untuk `key` dalam
// `windowMs` terakhir. Baris kedaluwarsa untuk key yang sama dibersihkan
// sekalian di setiap pemanggilan agar tabel tidak tumbuh tak terbatas.
export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<boolean> {
  const cutoff = new Date(Date.now() - windowMs);

  const [count] = await Promise.all([
    prisma.rateLimitHit.count({ where: { key, createdAt: { gte: cutoff } } }),
    prisma.rateLimitHit.deleteMany({ where: { key, createdAt: { lt: cutoff } } }),
  ]);

  if (count >= max) return false;

  await prisma.rateLimitHit.create({ data: { key } });
  return true;
}
