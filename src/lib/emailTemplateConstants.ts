// Konstanta & helper murni (tidak menyentuh database) supaya file ini aman
// diimpor dari komponen client (lihat lib/emailTemplates.ts untuk versi
// server yang membaca/menulis ke database).

export const EMAIL_TEMPLATE_TYPES = [
  "DITERIMA",
  "DITOLAK",
  "PERLU_PERBAIKAN",
  "TATA_TERTIB",
] as const;

export type EmailTemplateType = (typeof EMAIL_TEMPLATE_TYPES)[number];

export const EMAIL_TEMPLATE_LABEL: Record<EmailTemplateType, string> = {
  DITERIMA: "Pengajuan Diterima",
  DITOLAK: "Pengajuan Ditolak",
  PERLU_PERBAIKAN: "Perlu Perbaikan Dokumen",
  TATA_TERTIB: "Tata Tertib Magang",
};

// Placeholder yang tersedia untuk tiap jenis template, ditampilkan sebagai
// petunjuk di halaman Pengaturan > Email supaya admin tahu apa yang bisa
// dipakai (diganti otomatis saat email benar-benar dikirim).
export const EMAIL_TEMPLATE_PLACEHOLDERS: Record<EmailTemplateType, string[]> = {
  DITERIMA: ["nama", "nomorPengajuan", "link"],
  DITOLAK: ["nama", "nomorPengajuan", "alasan"],
  PERLU_PERBAIKAN: ["nama", "nomorPengajuan", "daftarDokumen", "catatanTambahan"],
  TATA_TERTIB: ["nama"],
};

export const DEFAULT_EMAIL_TEMPLATES: Record<
  EmailTemplateType,
  { subject: string | null; body: string }
> = {
  DITERIMA: {
    subject: "Selamat! Pengajuan Magang Diterima - {{nomorPengajuan}}",
    body: "Selamat {{nama}}, pengajuan magang Anda telah DITERIMA. Surat penerimaan sudah tersedia di dashboard. Akun Anda telah dibuat, silakan atur password melalui tautan berikut: {{link}}",
  },
  DITOLAK: {
    subject: "Status Pengajuan Magang - {{nomorPengajuan}}",
    body: "Mohon maaf {{nama}}, pengajuan magang Anda dengan nomor {{nomorPengajuan}} belum dapat kami terima. {{alasan}}",
  },
  PERLU_PERBAIKAN: {
    subject: "Perlu Perbaikan Pengajuan Magang - {{nomorPengajuan}}",
    body: "Pengajuan magang Anda dengan nomor {{nomorPengajuan}} memerlukan perbaikan. Anda TIDAK perlu mendaftar ulang — cukup lengkapi berkas berikut melalui halaman Cek Status pada website kami:\n{{daftarDokumen}}{{catatanTambahan}}",
  },
  TATA_TERTIB: {
    subject: null,
    body: "Tata Tertib Magang:\n1. Hadir tepat waktu sesuai jadwal yang telah ditentukan.\n2. Mengenakan pakaian rapi dan sopan selama berada di lingkungan instansi.\n3. Menjaga sikap, etika, dan kerahasiaan data/informasi instansi.\n4. Menyelesaikan tugas yang diberikan dengan penuh tanggung jawab.\n5. Melapor kepada pembimbing/pengawas jika berhalangan hadir.\n\nMohon dibaca dan dipatuhi selama menjalani magang, {{nama}}.",
  },
};

// Ganti {{key}} di template dengan nilai dari `vars`; placeholder yang tidak
// ada di `vars` dibiarkan apa adanya supaya admin sadar ada yang salah ketik,
// bukan hilang diam-diam.
export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in vars ? vars[key] : match
  );
}
