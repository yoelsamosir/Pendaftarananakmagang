import { NextResponse } from "next/server";
import { getSession, SessionPayload } from "./auth";

export async function requireRole(
  role: "ADMIN" | "PESERTA"
): Promise<{ session: SessionPayload } | { error: NextResponse }> {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Belum masuk" }, { status: 401 }) };
  }
  if (session.role !== role) {
    return { error: NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 }) };
  }
  return { session };
}
