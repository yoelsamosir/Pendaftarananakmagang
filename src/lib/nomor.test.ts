import { describe, it, expect, vi, beforeEach } from "vitest";

const countMock = vi.fn();
vi.mock("./prisma", () => ({
  prisma: {
    application: { count: (...args: unknown[]) => countMock(...args) },
    letter: { count: (...args: unknown[]) => countMock(...args) },
  },
}));

const { generateNomorPengajuan, generateNomorSurat } = await import("./nomor");

beforeEach(() => {
  countMock.mockReset();
});

describe("generateNomorPengajuan", () => {
  it("format MAG-<tahun>-0001 untuk pengajuan pertama tahun ini", async () => {
    countMock.mockResolvedValue(0);
    const nomor = await generateNomorPengajuan();
    const year = new Date().getFullYear();
    expect(nomor).toBe(`MAG-${year}-0001`);
  });

  it("increment nomor urut sesuai jumlah yang sudah ada", async () => {
    countMock.mockResolvedValue(41);
    const nomor = await generateNomorPengajuan();
    const year = new Date().getFullYear();
    expect(nomor).toBe(`MAG-${year}-0042`);
  });
});

describe("generateNomorSurat", () => {
  it("format nomor surat penerimaan dengan kode PB dan angka romawi bulan", async () => {
    countMock.mockResolvedValue(0);
    const nomor = await generateNomorSurat("PENERIMAAN");
    const year = new Date().getFullYear();
    expect(nomor).toMatch(new RegExp(`^001/PB/BLP-DIY/[IVX]+/${year}$`));
  });

  it("format nomor surat selesai dengan kode SK dan increment benar", async () => {
    countMock.mockResolvedValue(4);
    const nomor = await generateNomorSurat("SELESAI");
    const year = new Date().getFullYear();
    expect(nomor).toMatch(new RegExp(`^005/SK/BLP-DIY/[IVX]+/${year}$`));
  });
});
