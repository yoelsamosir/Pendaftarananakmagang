import { prisma } from "./prisma";
import { INSTANSI_EMAIL_RESMI } from "./constants";

export const SETTING_KEYS = {
  INSTANSI_EMAIL_RESMI: "instansi_email_resmi",
} as const;

// Fallback ke konstanta bawaan kalau admin belum pernah mengubahnya lewat
// Pengaturan (baris di AppSetting belum ada).
export async function getInstansiEmailResmi(): Promise<string> {
  const setting = await prisma.appSetting.findUnique({
    where: { key: SETTING_KEYS.INSTANSI_EMAIL_RESMI },
  });
  return setting?.value ?? INSTANSI_EMAIL_RESMI;
}

export async function setInstansiEmailResmi(email: string): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key: SETTING_KEYS.INSTANSI_EMAIL_RESMI },
    create: { key: SETTING_KEYS.INSTANSI_EMAIL_RESMI, value: email },
    update: { value: email },
  });
}
