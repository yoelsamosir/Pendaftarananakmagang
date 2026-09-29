import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Skrip sekali-jalan: menyamakan tabel NumberCounter (lihat lib/nomor.ts)
// dengan nomor tertinggi yang sudah pernah dikeluarkan lewat skema lama
// (count()+1). Wajib dijalankan sekali setelah `prisma db push` menambahkan
// model NumberCounter, SEBELUM ada pengajuan/keputusan baru yang mengambil
// nomor lagi — kalau dilewati, penomoran akan "reset" dari 0001 dan
// bertabrakan dengan nomor lama yang sudah ada (gagal di constraint unik).
// Aman dijalankan berulang (upsert, ambil nilai maksimum yang ditemukan).

const NOMOR_PENGAJUAN_RE = /^MAG-(\d{4})-(\d+)$/;
const NOMOR_SURAT_RE = /^(\d+)\/(PB|SK)\/BLP-DIY\/[IVX]+\/(\d{4})$/;

async function main() {
  const maxPengajuanPerYear = new Map<string, number>();
  const applications = await prisma.application.findMany({
    select: { nomorPengajuan: true },
  });
  for (const { nomorPengajuan } of applications) {
    const match = nomorPengajuan.match(NOMOR_PENGAJUAN_RE);
    if (!match) continue;
    const [, year, seq] = match;
    const key = `pengajuan:${year}`;
    maxPengajuanPerYear.set(key, Math.max(maxPengajuanPerYear.get(key) ?? 0, Number(seq)));
  }

  const maxSuratPerTypeYear = new Map<string, number>();
  const letters = await prisma.letter.findMany({ select: { number: true } });
  for (const { number } of letters) {
    const match = number.match(NOMOR_SURAT_RE);
    if (!match) continue;
    const [, seq, kode, year] = match;
    const type = kode === "PB" ? "PENERIMAAN" : "SELESAI";
    const key = `surat:${type}:${year}`;
    maxSuratPerTypeYear.set(key, Math.max(maxSuratPerTypeYear.get(key) ?? 0, Number(seq)));
  }

  const all = new Map([...maxPengajuanPerYear, ...maxSuratPerTypeYear]);
  for (const [key, value] of all) {
    await prisma.numberCounter.upsert({
      where: { id: key },
      update: { value },
      create: { id: key, value },
    });
    console.log(`${key} -> ${value}`);
  }

  console.log(`Selesai. ${all.size} counter di-set.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
