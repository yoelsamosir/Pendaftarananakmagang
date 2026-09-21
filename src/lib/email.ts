import { prisma } from "./prisma";
import { sendMail } from "./mailer";

// Email benar-benar dikirim lewat Gmail SMTP (lihat lib/mailer.ts), dan tetap
// dicatat di email_logs sebagai riwayat/audit di dalam sistem.
export async function sendNotificationEmail(params: {
  to: string;
  subject: string;
  body: string;
  type: string;
  applicationId?: string;
}) {
  let status = "SENT";
  try {
    await sendMail({ to: params.to, subject: params.subject, text: params.body });
  } catch (err) {
    status = "FAILED";
    console.error("Gagal mengirim email:", err);
  }

  await prisma.emailLog.create({
    data: {
      to: params.to,
      subject: params.subject,
      body: params.body,
      type: params.type,
      status,
      applicationId: params.applicationId,
    },
  });
}
