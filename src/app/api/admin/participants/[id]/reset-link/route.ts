import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/audit";

// Menghasilkan link setup/reset password Supabase Auth untuk dibagikan admin
// secara manual (WhatsApp, dsb) — sistem tidak mengirimkan email sungguhan.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const participant = await prisma.user.findUnique({ where: { id } });
  // "id" berasal dari URL dan bisa jadi ID akun mana pun yang ada di tabel
  // User -- tanpa cek role ini, tool yang seharusnya khusus peserta bisa
  // dipakai untuk membuat link reset password akun ADMIN lain (bukan cuma
  // akun peserta), yang sama sekali di luar tujuan endpoint ini.
  if (!participant || participant.role !== "PESERTA") {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email: participant.email,
  });
  if (error || !data.properties?.hashed_token) {
    return NextResponse.json(
      { error: `Gagal membuat link: ${error?.message}` },
      { status: 500 }
    );
  }

  const setupUrl = `/setup-password?token=${data.properties.hashed_token}`;

  await writeAuditLog({
    actorId: guard.session.userId,
    actorEmail: guard.session.email,
    action: "LINK_SETUP_PASSWORD_DIBUAT_ULANG",
    entityType: "User",
    entityId: id,
  });

  return NextResponse.json({ setupUrl });
}
