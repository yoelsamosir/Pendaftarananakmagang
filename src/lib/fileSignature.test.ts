import { describe, it, expect } from "vitest";
import { detectDocumentType } from "./fileSignature";

function fileFromBytes(bytes: number[], name = "test.bin") {
  return new File([new Uint8Array(bytes)], name);
}

describe("detectDocumentType", () => {
  it("mengenali berkas PDF asli dari byte %PDF", async () => {
    const file = fileFromBytes([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
    expect(await detectDocumentType(file)).toBe("pdf");
  });

  it("mengenali berkas DOCX asli (ada entry ZIP word/document.xml)", async () => {
    const header = [0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0];
    const marker = Array.from(new TextEncoder().encode("...word/document.xml..."));
    const file = fileFromBytes([...header, ...marker]);
    expect(await detectDocumentType(file)).toBe("docx");
  });

  it("menolak berkas ZIP yang bukan dokumen Word (xlsx/pptx/zip biasa mengaku docx)", async () => {
    // Byte PK di awal sama persis dengan docx -- tanpa cek entry ZIP-nya,
    // xlsx/pptx/zip biasa yang di-rename .docx akan lolos begitu saja.
    const header = [0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0];
    const marker = Array.from(new TextEncoder().encode("...xl/workbook.xml..."));
    const file = fileFromBytes([...header, ...marker], "bukan-docx.docx");
    expect(await detectDocumentType(file)).toBeNull();
  });

  it("mengenali berkas DOC lama (OLE compound)", async () => {
    const file = fileFromBytes([
      0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1,
    ]);
    expect(await detectDocumentType(file)).toBe("doc");
  });

  it("menolak berkas yang mengaku PDF tapi isinya bukan (spoofed MIME type)", async () => {
    // Skenario nyata: file .exe atau teks biasa yang di-rename jadi .pdf
    // dan Content-Type di-set manual jadi application/pdf oleh pengirim.
    const file = fileFromBytes(
      Array.from(new TextEncoder().encode("bukan dokumen asli")),
      "malware.pdf"
    );
    Object.defineProperty(file, "type", { value: "application/pdf" });
    expect(await detectDocumentType(file)).toBeNull();
  });

  it("mengembalikan null untuk berkas kosong", async () => {
    const file = fileFromBytes([]);
    expect(await detectDocumentType(file)).toBeNull();
  });
});
