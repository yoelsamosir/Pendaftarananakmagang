import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/guard";
import { getInstansiEmailResmi, setInstansiEmailResmi } from "@/lib/settings";
import { writeAuditLog } from "@/lib/audit";

const bodySchema = z.object({
  email: z.string().email("Format email tidak valid").max(200),
});

export async function GET() {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const email = await getInstansiEmailResmi();
  return NextResponse.json({ email });
}

export async function PATCH(req: NextRequest) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Data tidak valid" },
      { status: 400 }
    );
  }

  const before = await getInstansiEmailResmi();
  await setInstansiEmailResmi(parsed.data.email);

  await writeAuditLog({
    actorId: guard.session.userId,
    actorEmail: guard.session.email,
    action: "PENGATURAN_EMAIL_DIUBAH",
    entityType: "AppSetting",
    entityId: "instansi_email_resmi",
    before: { email: before },
    after: { email: parsed.data.email },
  });

  return NextResponse.json({ ok: true, email: parsed.data.email });
}
