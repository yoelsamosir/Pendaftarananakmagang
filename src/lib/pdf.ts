import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

type SuratPenerimaanData = {
  nomorSurat: string;
  tanggal: Date;
  namaLengkap: string;
  institusi: string;
  fakultas?: string | null;
  programStudi?: string | null;
  nimNis?: string | null;
  divisi?: string | null;
  rencanaMulai: Date;
  rencanaSelesai: Date;
  durasi?: string | null;
  nomorSuratAsal?: string | null;
  tanggalSuratAsal?: Date | null;
};

const KEPALA_BALAI = "Drs. Martono Heri Prasetyo, M.Si";

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

const KOP_ALAMAT = [
  "Gedung Grhatama Pustaka, Jalan Raya Janti, Banguntapan, Bantul (0274) 4536234",
  "www.balaiyanpus.jogjaprov.go.id, email: balaiyanpus@jogjaprov.go.id",
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
  y -= 4;
  KOP_ALAMAT.forEach((line) => {
    const size = 9;
    const textWidth = font.widthOfTextAtSize(line, size);
    page.drawText(line, {
      x: (width - textWidth) / 2,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 12;
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

// Menggambar blok "Label : Nilai" dengan titik dua sejajar secara presisi.
// Padding pakai spasi manual (mis. "Nomor     : x") tidak bisa dipakai untuk
// ini karena Helvetica bukan font monospace -- lebar tiap karakter berbeda,
// jadi titik duanya tidak akan sejajar walau jumlah spasinya "pas" di editor.
function drawFieldBlock(
  page: PDFPage,
  font: PDFFont,
  fields: { label: string; value: string; bold?: boolean }[],
  x: number,
  yStart: number,
  size: number,
  lh: number,
  boldFont?: PDFFont
): number {
  const maxLabelWidth = Math.max(
    ...fields.map((f) => font.widthOfTextAtSize(f.label, size))
  );
  const colonX = x + maxLabelWidth + 4;
  const valueX = colonX + 8;
  let y = yStart;
  for (const f of fields) {
    const useFont = f.bold && boldFont ? boldFont : font;
    page.drawText(f.label, { x, y, size, font: useFont });
    page.drawText(":", { x: colonX, y, size, font: useFont });
    page.drawText(f.value, { x: valueX, y, size, font: useFont });
    y -= lh;
  }
  return y;
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

  y = drawFieldBlock(
    page,
    font,
    [
      { label: "Nomor", value: data.nomorSurat },
      { label: "Sifat", value: "Biasa" },
      { label: "Lampiran", value: "-" },
      { label: "Hal", value: "Balasan Permohonan Magang", bold: true },
    ],
    left,
    y,
    size,
    lh,
    bold
  );
  y -= lh;

  if (data.fakultas) {
    line(`Yth. Dekan Fakultas ${data.fakultas}`);
    line(data.institusi);
  } else {
    line(`Yth. Pimpinan ${data.institusi}`);
  }
  line(`di tempat`);
  y -= lh;

  const suratAsalText = data.nomorSuratAsal
    ? `Menindaklanjuti surat nomor ${data.nomorSuratAsal}${
        data.tanggalSuratAsal ? ` tanggal ${tgl(data.tanggalSuratAsal)}` : ""
      } tentang pengantar mahasiswa PKL/magang di Balai Layanan Perpustakaan DPAD DIY, mahasiswa atas nama:`
    : `Menindaklanjuti permohonan pengantar mahasiswa PKL/magang di Balai Layanan Perpustakaan DPAD DIY, mahasiswa atas nama:`;
  y = drawWrapped(page, font, suratAsalText, left, y, 495, size, lh);
  y -= lh / 2;

  y = drawTable(
    page,
    font,
    bold,
    [
      ["No", "Nama", "NIM/NIS"],
      ["1", data.namaLengkap, data.nimNis || "-"],
    ],
    [40, 290, 165],
    left,
    y,
    22
  );
  y -= lh;

  const durasiText = data.durasi || hitungDurasiBulan(data.rencanaMulai, data.rencanaSelesai);
  const terimaText = `Pada prinsipnya, kami dapat menerima permohonan mahasiswa magang/KKL ke Balai Layanan Perpustakaan DPAD DIY selama ${durasiText}.`;
  y = drawWrapped(page, font, terimaText, left, y, 495, size, lh);
  y -= lh / 2;

  const wbkText = `Sebagai informasi dapat kami sampaikan bahwa Balai Layanan Perpustakaan terus berkomitmen menjadi Unit Pelaksana Teknis (UPT) berpredikat Wilayah Bebas dari Korupsi (WBK) menuju Wilayah Birokrasi Bersih dan Melayani (WBBM). Seluruh layanan publik Balai Layanan Perpustakaan DPAD DIY mengacu kepada Standar Layanan Publik dengan tarif layanan sesuai ketentuan peraturan perundang-undangan. Dalam melaksanakan tugas pegawai Balai Layanan Perpustakaan DPAD DIY wajib memegang teguh core value ASN BerAKHLAK dan tidak diperkenankan meminta, menerima dan/atau memberikan gratifikasi dan suap dalam bentuk apapun.`;
  y = drawWrapped(page, font, wbkText, left, y, 495, size, lh);
  y -= lh / 2;

  const penutup = `Demikian atas perhatian dan kerja samanya disampaikan terima kasih.`;
  y = drawWrapped(page, font, penutup, left, y, 495, size, lh);

  y -= lh * 2;
  line(`Yogyakarta, ${tgl(data.tanggal)}`, font, size, 300);
  line(`Kepala Balai Layanan Perpustakaan,`, font, size, 300);
  y -= lh * 4;
  line(KEPALA_BALAI, bold, size, 300);

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

function hitungDurasiBulan(mulai: Date, selesai: Date) {
  const months =
    (selesai.getFullYear() - mulai.getFullYear()) * 12 +
    (selesai.getMonth() - mulai.getMonth());
  return `${Math.max(1, Math.round(months))} bulan`;
}

function drawTable(
  page: PDFPage,
  font: PDFFont,
  bold: PDFFont,
  rows: string[][],
  colWidths: number[],
  x: number,
  y: number,
  rowHeight: number
) {
  let curY = y;
  rows.forEach((row, rowIndex) => {
    let curX = x;
    row.forEach((cell, colIndex) => {
      page.drawRectangle({
        x: curX,
        y: curY - rowHeight,
        width: colWidths[colIndex],
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
      page.drawText(cell, {
        x: curX + 6,
        y: curY - rowHeight + 7,
        size: 10,
        font: rowIndex === 0 ? bold : font,
      });
      curX += colWidths[colIndex];
    });
    curY -= rowHeight;
  });
  return curY;
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

  const identityFields = [
    { label: "Nama", value: data.namaLengkap },
    { label: "Institusi", value: data.institusi },
    ...(data.programStudi ? [{ label: "Program Studi", value: data.programStudi }] : []),
    ...(data.nimNis ? [{ label: "NIM/NIS", value: data.nimNis }] : []),
    ...(data.divisi ? [{ label: "Divisi/Bagian", value: data.divisi }] : []),
    { label: "Periode Magang", value: `${tgl(data.mulai)} s.d. ${tgl(data.selesai)}` },
  ];
  y = drawFieldBlock(page, font, identityFields, left, y, size, lh);
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
