import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

export async function sendMail(params: { to: string; subject: string; text: string }) {
  const from = process.env.GMAIL_USER;
  if (!from || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("Konfigurasi GMAIL_USER/GMAIL_APP_PASSWORD belum diisi");
  }

  await getTransporter().sendMail({
    from: `"Sistem Magang Balai Layanan Perpustakaan" <${from}>`,
    to: params.to,
    subject: params.subject,
    text: params.text,
  });
}
