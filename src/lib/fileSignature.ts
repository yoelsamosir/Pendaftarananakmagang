// Verifikasi tipe berkas dari byte awal isinya (magic number), bukan dari
// header `Content-Type` yang dikirim browser — header itu mudah dipalsukan
// dan tidak bisa dipercaya sebagai validasi keamanan di server.
const SIGNATURES: { type: "pdf" | "docx" | "doc"; bytes: number[] }[] = [
  { type: "pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { type: "docx", bytes: [0x50, 0x4b, 0x03, 0x04] }, // PK.. (zip: docx/xlsx/pptx/zip biasa)
  { type: "doc", bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] }, // OLE compound (doc/xls/ppt)
];

// docx/xlsx/pptx/zip biasa semuanya diawali magic number ZIP yang sama —
// tidak cukup untuk membedakan "ini benar dokumen Word" dari "ini file zip
// apa saja yang diganti ekstensinya". Setiap .docx asli (Office Open XML)
// selalu punya entry ZIP bernama tepat "word/document.xml"; nama entry ZIP
// tersimpan sebagai teks ASCII biasa di dalam berkas (bukan terkompresi),
// jadi dicari langsung sebagai substring cukup untuk memverifikasi tanpa
// perlu library parser ZIP penuh.
const DOCX_MARKER = "word/document.xml";

async function looksLikeDocx(file: File): Promise<boolean> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.includes(DOCX_MARKER);
}

export async function detectDocumentType(
  file: File
): Promise<"pdf" | "docx" | "doc" | null> {
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  for (const sig of SIGNATURES) {
    if (!sig.bytes.every((b, i) => head[i] === b)) continue;
    if (sig.type === "docx" && !(await looksLikeDocx(file))) {
      return null; // ZIP valid, tapi bukan dokumen Word (xlsx/pptx/zip biasa)
    }
    return sig.type;
  }
  return null;
}
