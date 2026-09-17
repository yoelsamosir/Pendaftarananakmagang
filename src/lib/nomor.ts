import { prisma } from "./prisma";

// Nomor pengajuan: MAG-2026-0001 (berbeda dari nomor surat resmi, lihat lib/pdf.ts)
export async function generateNomorPengajuan() {
  const year = new Date().getFullYear();
  const prefix = `MAG-${year}-`;
  const count = await prisma.application.count({
    where: { nomorPengajuan: { startsWith: prefix } },
  });
  const next = (count + 1).toString().padStart(4, "0");
  return `${prefix}${next}`;
}

export async function generateNomorSurat(type: "PENERIMAAN" | "SELESAI") {
  const year = new Date().getFullYear();
  const romanMonth = toRoman(new Date().getMonth() + 1);
  const kode = type === "PENERIMAAN" ? "PB" : "SK";
  const count = await prisma.letter.count({
    where: { type, date: { gte: new Date(`${year}-01-01`) } },
  });
  const next = (count + 1).toString().padStart(3, "0");
  return `${next}/${kode}/BLP-DIY/${romanMonth}/${year}`;
}

function toRoman(month: number) {
  const romans = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
  ];
  return romans[month - 1] || String(month);
}
