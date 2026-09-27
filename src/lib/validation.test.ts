import { describe, it, expect } from "vitest";
import {
  applicationSchema,
  loginSchema,
  setupPasswordSchema,
  changePasswordSchema,
} from "./validation";

describe("applicationSchema", () => {
  const base = {
    namaLengkap: "Budi Santoso",
    email: "budi@example.com",
    telepon: "081234567890",
    institusi: "Universitas Contoh",
    rencanaMulai: "2026-10-01",
    rencanaSelesai: "2026-12-01",
  };

  it("menerima data minimal yang valid", () => {
    const result = applicationSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("menolak email tidak valid", () => {
    const result = applicationSchema.safeParse({ ...base, email: "bukan-email" });
    expect(result.success).toBe(false);
  });

  it("menolak nomor telepon dengan huruf", () => {
    const result = applicationSchema.safeParse({ ...base, telepon: "abc123" });
    expect(result.success).toBe(false);
  });

  it("menolak nama lengkap terlalu pendek", () => {
    const result = applicationSchema.safeParse({ ...base, namaLengkap: "Ab" });
    expect(result.success).toBe(false);
  });

  it("menolak jika rencana mulai kosong", () => {
    const result = applicationSchema.safeParse({ ...base, rencanaMulai: "" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("menerima email dan password non-kosong", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "x" }).success
    ).toBe(true);
  });

  it("menolak password kosong", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(
      false
    );
  });
});

describe("password baru (setup & ganti password)", () => {
  it("menolak password tanpa huruf besar", () => {
    const result = setupPasswordSchema.safeParse({
      token: "t",
      password: "lowercase1",
      confirmPassword: "lowercase1",
    });
    expect(result.success).toBe(false);
  });

  it("menolak password tanpa angka", () => {
    const result = setupPasswordSchema.safeParse({
      token: "t",
      password: "TidakAdaAngka",
      confirmPassword: "TidakAdaAngka",
    });
    expect(result.success).toBe(false);
  });

  it("menolak password kurang dari 8 karakter", () => {
    const result = setupPasswordSchema.safeParse({
      token: "t",
      password: "Ab1",
      confirmPassword: "Ab1",
    });
    expect(result.success).toBe(false);
  });

  it("menerima password kuat yang valid", () => {
    const result = setupPasswordSchema.safeParse({
      token: "t",
      password: "Password123",
      confirmPassword: "Password123",
    });
    expect(result.success).toBe(true);
  });

  it("menolak jika konfirmasi password tidak sama", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "lama",
      newPassword: "Password123",
      confirmPassword: "Password124",
    });
    expect(result.success).toBe(false);
  });
});
