// Verifikasi tipe berkas dari byte awal isinya (magic number), bukan dari
// header `Content-Type` yang dikirim browser — header itu mudah dipalsukan
// dan tidak bisa dipercaya sebagai validasi keamanan di server.
const SIGNATURES: { type: "pdf" | "docx" | "doc"; bytes: number[] }[] = [
  { type: "pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { type: "docx", bytes: [0x50, 0x4b, 0x03, 0x04] }, // PK.. (zip: docx/xlsx/pptx)
  { type: "doc", bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] }, // OLE compound (doc/xls/ppt)
];

export async function detectDocumentType(
  file: File
): Promise<"pdf" | "docx" | "doc" | null> {
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  for (const sig of SIGNATURES) {
    if (sig.bytes.every((b, i) => head[i] === b)) return sig.type;
  }
  return null;
}
