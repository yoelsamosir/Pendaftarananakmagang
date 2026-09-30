import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/guard";
import {
  EMAIL_TEMPLATE_TYPES,
  getAllEmailTemplates,
  getEmailTemplate,
  setEmailTemplate,
} from "@/lib/emailTemplates";
import { writeAuditLog } from "@/lib/audit";

const bodySchema = z.object({
  type: z.enum(EMAIL_TEMPLATE_TYPES),
  subject: z.string().max(200).nullable().optional(),
  body: z.string().min(1, "Isi email wajib diisi").max(5000),
});

export async function GET() {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const templates = await getAllEmailTemplates();
  return NextResponse.json({ templates });
}

export async function PATCH(req: NextRequest) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Data tidak valid" },
      { status: 400 }
    );
  }
  const { type, body } = parsed.data;
  const subject = parsed.data.subject ?? null;

  const before = await getEmailTemplate(type);
  await setEmailTemplate(type, subject, body);

  await writeAuditLog({
    actorId: guard.session.userId,
    actorEmail: guard.session.email,
    action: "TEMPLATE_EMAIL_DIUBAH",
    entityType: "EmailTemplate",
    entityId: type,
    before,
    after: { subject, body },
  });

  return NextResponse.json({ ok: true });
}
