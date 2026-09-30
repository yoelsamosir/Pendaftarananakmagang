import { describe, it, expect, vi, beforeEach } from "vitest";

const queryRawMock = vi.fn();
const deleteManyMock = vi.fn();

vi.mock("./prisma", () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => queryRawMock(...args),
    rateLimitHit: {
      deleteMany: (...args: unknown[]) => deleteManyMock(...args),
    },
  },
}));

const { checkRateLimit, getClientIp } = await import("./rateLimit");

beforeEach(() => {
  queryRawMock.mockReset();
  deleteManyMock.mockReset().mockResolvedValue({ count: 0 });
});

describe("checkRateLimit", () => {
  it("mengizinkan saat insert atomik berhasil (masih di bawah batas)", async () => {
    queryRawMock.mockResolvedValue([{ id: "some-id" }]);
    const allowed = await checkRateLimit("test:key", 5, 60_000);
    expect(allowed).toBe(true);
  });

  it("menolak saat insert atomik tidak menghasilkan baris (sudah mencapai batas)", async () => {
    queryRawMock.mockResolvedValue([]);
    const allowed = await checkRateLimit("test:key", 5, 60_000);
    expect(allowed).toBe(false);
  });
});

describe("getClientIp", () => {
  it("mengambil IP pertama dari header x-forwarded-for", () => {
    const req = {
      headers: new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }),
    } as never;
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("fallback ke x-real-ip jika x-forwarded-for tidak ada", () => {
    const req = {
      headers: new Headers({ "x-real-ip": "9.9.9.9" }),
    } as never;
    expect(getClientIp(req)).toBe("9.9.9.9");
  });

  it("mengembalikan 'unknown' jika tidak ada header IP sama sekali", () => {
    const req = { headers: new Headers() } as never;
    expect(getClientIp(req)).toBe("unknown");
  });
});
