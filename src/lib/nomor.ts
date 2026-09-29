import { prisma } from "./prisma";

// Nomor pengajuan & nomor surat harus unik dan berurut walau ada beberapa
// submit/keputusan admin yang terjadi bersamaan. Increment dilakukan lewat
// satu statement SQL atomik (INSERT ... ON CONFLICT DO UPDATE ... RETURNING),
// yang otomatis mengunci baris counter-nya di Postgres selama statement itu
// berjalan — jauh lebih aman daripada count()+1 lalu create() terpisah
// seperti sebelumnya, yang rawan race condition: dua request bersamaan bisa
// membaca count yang sama, menghasilkan nomor yang sama, lalu salah satunya
// gagal di constraint unik (dan untuk keputusan admin, itu terjadi setelah
// status pengajuan sudah berubah).
async function nextCounterValue(key: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ value: number }[]>`
    INSERT INTO "NumberCounter" ("id", "value")
    VALUES (${key}, 1)
    ON CONFLICT ("id") DO UPDATE SET "value" = "NumberCounter"."value" + 1
    RETURNING "value"
  `;
  return rows[0].value;
}

// Nomor pengajuan: MAG-2026-0001 (berbeda dari nomor surat resmi, lihat lib/pdf.ts)
export async function generateNomorPengajuan() {
  const year = new Date().getFullYear();
  const next = await nextCounterValue(`pengajuan:${year}`);
  return `MAG-${year}-${next.toString().padStart(4, "0")}`;
}

export async function generateNomorSurat(type: "PENERIMAAN" | "SELESAI") {
  const year = new Date().getFullYear();
  const romanMonth = toRoman(new Date().getMonth() + 1);
  const kode = type === "PENERIMAAN" ? "PB" : "SK";
  const next = await nextCounterValue(`surat:${type}:${year}`);
  return `${next.toString().padStart(3, "0")}/${kode}/BLP-DIY/${romanMonth}/${year}`;
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
