import { describe, it, expect } from "vitest";
import { minRencanaMulaiDate, minRencanaMulaiUtc } from "./internshipRules";

describe("minRencanaMulaiUtc", () => {
  it("dini hari WIB tetap dihitung hari ini, bukan kemarin (UTC)", () => {
    // 19 Nov 03.00 WIB = 18 Nov 20.00 UTC
    const min = minRencanaMulaiUtc(new Date("2026-11-18T20:00:00Z"));
    expect(min.toISOString()).toBe("2026-11-26T00:00:00.000Z");
    expect(new Date("2026-11-25") < min).toBe(true);
    expect(new Date("2026-11-26") < min).toBe(false);
  });

  it("berganti hari tepat pukul 00.00 WIB", () => {
    expect(minRencanaMulaiUtc(new Date("2026-11-19T16:59:59Z")).toISOString()).toBe(
      "2026-11-26T00:00:00.000Z"
    );
    expect(minRencanaMulaiUtc(new Date("2026-11-19T17:00:00Z")).toISOString()).toBe(
      "2026-11-27T00:00:00.000Z"
    );
  });

  it("melewati pergantian bulan dan tahun", () => {
    expect(minRencanaMulaiUtc(new Date("2026-12-28T05:00:00Z")).toISOString()).toBe(
      "2027-01-04T00:00:00.000Z"
    );
  });
});

describe("minRencanaMulaiDate", () => {
  it("mengembalikan tengah malam lokal pada tanggal minimal WIB", () => {
    const min = minRencanaMulaiDate(new Date("2026-11-18T20:00:00Z"));
    expect([min.getFullYear(), min.getMonth(), min.getDate()]).toEqual([2026, 10, 26]);
    expect([min.getHours(), min.getMinutes()]).toEqual([0, 0]);
  });
});
