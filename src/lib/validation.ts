import { z } from "zod";
import { PASSWORD_RULES } from "./passwordRules";

export const applicationSchema = z.object({
  namaLengkap: z.string().min(3, "Nama lengkap wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  telepon: z
    .string()
    .min(9, "Nomor telepon tidak valid")
    .regex(/^[0-9+\-\s]+$/, "Nomor telepon tidak valid"),
  alamat: z.string().optional(),
  tanggalLahir: z.string().optional(),

  institusi: z.string().min(2, "Institusi wajib diisi"),
  fakultas: z.string().optional(),
  programStudi: z.string().optional(),
  nimNis: z.string().optional(),
  semesterKelas: z.string().optional(),

  jenisMagang: z.string().optional(),
  rencanaMulai: z.string().min(1, "Rencana mulai wajib diisi"),
  rencanaSelesai: z.string().min(1, "Rencana selesai wajib diisi"),
  durasi: z.string().optional(),
  divisiId: z.string().optional(),
  catatan: z.string().optional(),
  nomorSuratAsal: z.string().optional(),
  tanggalSuratAsal: z.string().optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Dipakai untuk password baru (bukan login) — cukup kuat untuk akun admin
// maupun peserta. Aturannya sendiri didefinisikan sekali di lib/passwordRules.ts
// (dipakai juga oleh checklist di client) supaya tidak ada dua sumber kebenaran.
const strongPassword = PASSWORD_RULES.reduce(
  (schema, rule) => schema.refine(rule.test, `Password harus: ${rule.message.toLowerCase()}`),
  z.string()
);

export const setupPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: strongPassword,
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: strongPassword,
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export const lengkapiBerkasSchema = z.object({
  nomor: z.string().min(1, "Nomor pengajuan wajib diisi"),
  email: z.string().email("Format email tidak valid"),
});
