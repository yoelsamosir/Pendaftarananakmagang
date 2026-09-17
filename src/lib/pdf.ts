import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

type SuratPenerimaanData = {
  nomorSurat: string;
  tanggal: Date;
  namaLengkap: string;
  institusi: string;
  programStudi?: string | null;
  nimNis?: string | null;
  divisi?: string | null;
  rencanaMulai: Date;
  rencanaSelesai: Date;
};

type SuratSelesaiData = {
  nomorSurat: string;
  tanggal: Date;
  namaLengkap: string;
  institusi: string;
  programStudi?: string | null;
  nimNis?: string | null;
  divisi?: string | null;
  mulai: Date;
  selesai: Date;
};

const KOP = [
  "PEMERINTAH DAERAH DAERAH ISTIMEWA YOGYAKARTA",
  "DINAS PERPUSTAKAAN DAN ARSIP DAERAH",
  "BALAI LAYANAN PERPUSTAKAAN",
];

async function baseDoc() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  return { doc, page, font, bold };
}

function drawKop(page: PDFPage, bold: PDFFont, font: PDFFont) {
  const { width } = page.getSize();
  let y = 800;
  KOP.forEach((line, i) => {
    const f = i === 2 ? bold : font;
    const size = i === 2 ? 13 : 11;
    const textWidth = f.widthOfTextAtSize(line, size);
    page.drawText(line, {
      x: (width - textWidth) / 2,
      y,
      size,
      font: f,
      color: rgb(0, 0, 0),
    });
    y -= 16;
  });
  page.drawLine({
    start: { x: 50, y: y - 4 },
    end: { x: width - 50, y: y - 4 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  return y - 30;
}

function tgl(d: Date) {
  return format(d, "d MMMM yyyy", { locale: localeId });
}

export async function generateSuratPenerimaanPdf(
  data: SuratPenerimaanData
): Promise<Buffer> {
  const { doc, page, font, bold } = await baseDoc();
  let y = drawKop(page, bold, font);
  const left = 50;
  const size = 11;
  const lh = 16;

  const line = (text: string, f = font, s = size, indent = 0) => {
    page.drawText(text, { x: left + indent, y, size: s, font: f });
    y -= lh;
  };

  line(`Nomor     : ${data.nomorSurat}`);
  line(`Sifat     : Biasa`);
  line(`Lampiran  : -`);
  line(`Hal       : Balasan Permohonan Magang`, bold);
  y -= lh;
  line(`Yth. ${data.namaLengkap}`);
  line(`${data.institusi}`);
  y -= lh;

  const isi = `Menindaklanjuti permohonan magang yang Saudara/i ajukan, dengan ini kami sampaikan bahwa permohonan magang atas nama tersebut di bawah ini DITERIMA untuk melaksanakan kegiatan magang di Balai Layanan Perpustakaan, Dinas Perpustakaan dan Arsip Daerah DIY, dengan data sebagai berikut:`;
  y = drawWrapped(page, font, isi, left, y, 495, size, lh);
  y -= lh / 2;

  line(`Nama              : ${data.namaLengkap}`);
  line(`Institusi         : ${data.institusi}`);
  if (data.programStudi) line(`Program Studi     : ${data.programStudi}`);
  if (data.nimNis) line(`NIM/NIS           : ${data.nimNis}`);
  if (data.divisi) line(`Divisi/Bagian     : ${data.divisi}`);
  line(`Periode Magang    : ${tgl(data.rencanaMulai)} s.d. ${tgl(data.rencanaSelesai)}`);
  y -= lh;

  const penutup = `Demikian surat balasan ini kami sampaikan untuk dapat dipergunakan sebagaimana mestinya. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.`;
  y = drawWrapped(page, font, penutup, left, y, 495, size, lh);

  y -= lh * 2;
  line(`Yogyakarta, ${tgl(data.tanggal)}`, font, size, 300);
  line(`Kepala Balai Layanan Perpustakaan`, font, size, 300);
  y -= lh * 3;
  line(`......................................`, font, size, 300);
  line(`NIP. .................................`, font, size, 300);

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

export async function generateSuratSelesaiPdf(
  data: SuratSelesaiData
): Promise<Buffer> {
  const { doc, page, font, bold } = await baseDoc();
  let y = drawKop(page, bold, font);
  const left = 50;
  const size = 11;
  const lh = 16;

  const line = (text: string, f = font, s = size, indent = 0) => {
    page.drawText(text, { x: left + indent, y, size: s, font: f });
    y -= lh;
  };

  const titleText = "SURAT KETERANGAN TELAH SELESAI MAGANG";
  const tw = bold.widthOfTextAtSize(titleText, 13);
  page.drawText(titleText, {
    x: (page.getSize().width - tw) / 2,
    y,
    size: 13,
    font: bold,
  });
  y -= lh;
  const nomorText = `Nomor: ${data.nomorSurat}`;
  const nw = font.widthOfTextAtSize(nomorText, size);
  page.drawText(nomorText, {
    x: (page.getSize().width - nw) / 2,
    y,
    size,
    font,
  });
  y -= lh * 2;

  const isi = `Yang bertanda tangan di bawah ini, Kepala Balai Layanan Perpustakaan, Dinas Perpustakaan dan Arsip Daerah Daerah Istimewa Yogyakarta, dengan ini menerangkan bahwa:`;
  y = drawWrapped(page, font, isi, left, y, 495, size, lh);
  y -= lh / 2;

  line(`Nama              : ${data.namaLengkap}`);
  line(`Institusi         : ${data.institusi}`);
  if (data.programStudi) line(`Program Studi     : ${data.programStudi}`);
  if (data.nimNis) line(`NIM/NIS           : ${data.nimNis}`);
  if (data.divisi) line(`Divisi/Bagian     : ${data.divisi}`);
  line(`Periode Magang    : ${tgl(data.mulai)} s.d. ${tgl(data.selesai)}`);
  y -= lh;

  const penutup = `telah melaksanakan kegiatan magang dengan baik di Balai Layanan Perpustakaan sesuai periode tersebut di atas. Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.`;
  y = drawWrapped(page, font, penutup, left, y, 495, size, lh);

  y -= lh * 2;
  line(`Yogyakarta, ${tgl(data.tanggal)}`, font, size, 300);
  line(`Kepala Balai Layanan Perpustakaan`, font, size, 300);
  y -= lh * 3;
  line(`......................................`, font, size, 300);
  line(`NIP. .................................`, font, size, 300);

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

function drawWrapped(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  lh: number
) {
  const words = text.split(" ");
  let currentLine = "";
  for (const word of words) {
    const test = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      page.drawText(currentLine, { x, y, size, font });
      y -= lh;
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) {
    page.drawText(currentLine, { x, y, size, font });
    y -= lh;
  }
  return y;
}
