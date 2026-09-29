import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const isActive = body?.isActive;
  if (typeof isActive !== "boolean") {
    return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
  }

  const participant = await prisma.user.findUnique({ where: { id } });
  // Sama seperti reset-link: tanpa cek role ini, endpoint "peserta" ini bisa
  // dipakai untuk mem-ban/unban akun ADMIN lain lewat Supabase Auth.
  if (!participant || participant.role !== "PESERTA") {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  const supabaseAdmin = createAdminClient();
  // Nonaktif = akun dibanned di Supabase Auth sehingga tidak bisa login sama sekali.
  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
    ban_duration: isActive ? "none" : "876000h",
  });
  if (error) {
    return NextResponse.json(
      { error: `Gagal mengubah status akun: ${error.message}` },
      { status: 500 }
    );
  }

  await prisma.user.update({ where: { id }, data: { isActive } });

  await writeAuditLog({
    actorId: guard.session.userId,
    actorEmail: guard.session.email,
    action: isActive ? "AKUN_PESERTA_DIAKTIFKAN" : "AKUN_PESERTA_DINONAKTIFKAN",
    entityType: "User",
    entityId: id,
    before: { isActive: participant.isActive },
    after: { isActive },
  });

  return NextResponse.json({ ok: true, isActive });
}
