import { prisma } from "./prisma";
import {
  EMAIL_TEMPLATE_TYPES,
  DEFAULT_EMAIL_TEMPLATES,
  type EmailTemplateType,
} from "./emailTemplateConstants";

export {
  EMAIL_TEMPLATE_TYPES,
  EMAIL_TEMPLATE_LABEL,
  EMAIL_TEMPLATE_PLACEHOLDERS,
  renderTemplate,
} from "./emailTemplateConstants";
export type { EmailTemplateType } from "./emailTemplateConstants";

export async function getEmailTemplate(
  type: EmailTemplateType
): Promise<{ subject: string | null; body: string }> {
  const row = await prisma.emailTemplate.findUnique({ where: { type } });
  if (!row) return DEFAULT_EMAIL_TEMPLATES[type];
  return { subject: row.subject, body: row.body };
}

export async function getAllEmailTemplates(): Promise<
  Record<EmailTemplateType, { subject: string | null; body: string }>
> {
  const rows = await prisma.emailTemplate.findMany();
  const byType = new Map(rows.map((r) => [r.type, r]));
  const result = {} as Record<EmailTemplateType, { subject: string | null; body: string }>;
  for (const type of EMAIL_TEMPLATE_TYPES) {
    const row = byType.get(type);
    result[type] = row ? { subject: row.subject, body: row.body } : DEFAULT_EMAIL_TEMPLATES[type];
  }
  return result;
}

export async function setEmailTemplate(
  type: EmailTemplateType,
  subject: string | null,
  body: string
): Promise<void> {
  await prisma.emailTemplate.upsert({
    where: { type },
    create: { type, subject, body },
    update: { subject, body },
  });
}
