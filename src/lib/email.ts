import { prisma } from "./prisma";

// MVP: email tidak benar-benar dikirim ke SMTP eksternal, hanya dicatat di email_logs
// (peserta melihat notifikasi via dashboard). Integrasi layanan email transaksional
// (mis. Resend) dapat ditambahkan di sini pada tahap pengembangan berikutnya.
export async function sendNotificationEmail(params: {
  to: string;
  subject: string;
  body: string;
  type: string;
  applicationId?: string;
}) {
  await prisma.emailLog.create({
    data: {
      to: params.to,
      subject: params.subject,
      body: params.body,
      type: params.type,
      status: "SENT",
      applicationId: params.applicationId,
    },
  });
}
