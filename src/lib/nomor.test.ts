import { describe, it, expect, vi, beforeEach } from "vitest";

const queryRawMock = vi.fn();
vi.mock("./prisma", () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => queryRawMock(...args),
  },
}));

const { generateNomorPengajuan, generateNomorSurat } = await import("./nomor");

beforeEach(() => {
  queryRawMock.mockReset();
});

describe("generateNomorPengajuan", () => {
  it("format MAG-<tahun>-0001 untuk pengajuan pertama tahun ini", async () => {
    queryRawMock.mockResolvedValue([{ value: 1 }]);
    const nomor = await generateNomorPengajuan();
    const year = new Date().getFullYear();
    expect(nomor).toBe(`MAG-${year}-0001`);
  });

  it("increment nomor urut sesuai nilai counter atomik", async () => {
    queryRawMock.mockResolvedValue([{ value: 42 }]);
    const nomor = await generateNomorPengajuan();
    const year = new Date().getFullYear();
    expect(nomor).toBe(`MAG-${year}-0042`);
  });
});

describe("generateNomorSurat", () => {
  it("format nomor surat penerimaan dengan kode PB dan angka romawi bulan", async () => {
    queryRawMock.mockResolvedValue([{ value: 1 }]);
    const nomor = await generateNomorSurat("PENERIMAAN");
    const year = new Date().getFullYear();
    expect(nomor).toMatch(new RegExp(`^001/PB/BLP-DIY/[IVX]+/${year}$`));
  });

  it("format nomor surat selesai dengan kode SK dan increment benar", async () => {
    queryRawMock.mockResolvedValue([{ value: 5 }]);
    const nomor = await generateNomorSurat("SELESAI");
    const year = new Date().getFullYear();
    expect(nomor).toMatch(new RegExp(`^005/SK/BLP-DIY/[IVX]+/${year}$`));
  });
});
