import { describe, it, expect, vi, beforeEach } from "vitest";

const countMock = vi.fn();
const deleteManyMock = vi.fn();
const createMock = vi.fn();

vi.mock("./prisma", () => ({
  prisma: {
    rateLimitHit: {
      count: (...args: unknown[]) => countMock(...args),
      deleteMany: (...args: unknown[]) => deleteManyMock(...args),
      create: (...args: unknown[]) => createMock(...args),
    },
  },
}));

const { checkRateLimit, getClientIp } = await import("./rateLimit");

beforeEach(() => {
  countMock.mockReset();
  deleteManyMock.mockReset().mockResolvedValue({ count: 0 });
  createMock.mockReset().mockResolvedValue({});
});

describe("checkRateLimit", () => {
  it("mengizinkan dan mencatat hit baru saat masih di bawah batas", async () => {
    countMock.mockResolvedValue(2);
    const allowed = await checkRateLimit("test:key", 5, 60_000);
    expect(allowed).toBe(true);
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it("menolak dan tidak mencatat hit baru saat sudah mencapai batas", async () => {
    countMock.mockResolvedValue(5);
    const allowed = await checkRateLimit("test:key", 5, 60_000);
    expect(allowed).toBe(false);
    expect(createMock).not.toHaveBeenCalled();
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
