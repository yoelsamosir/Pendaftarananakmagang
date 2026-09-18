import { randomUUID } from "crypto";
import { createAdminClient } from "./supabase/admin";

// Semua dokumen (pengajuan, surat PDF) disimpan di bucket privat Supabase
// Storage. Akses selalu lewat service role di server — tidak ada URL publik —
// otorisasi per-file diperiksa di /api/files/[id] sebelum stream dikirim.
const BUCKET = "documents";

export async function saveUploadedFile(file: File, subDir: string) {
  const supabase = createAdminClient();

  const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
  const key = `${randomUUID()}${ext}`;
  const storedPath = `${subDir}/${key}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(storedPath, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(`Gagal mengunggah dokumen: ${error.message}`);

  return {
    storedPath,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: buffer.length,
  };
}

export async function saveGeneratedFile(buffer: Buffer, subDir: string, fileName: string) {
  const supabase = createAdminClient();

  const key = `${randomUUID()}-${fileName}`;
  const storedPath = `${subDir}/${key}`;

  const { error } = await supabase.storage.from(BUCKET).upload(storedPath, buffer, {
    contentType: "application/pdf",
    upsert: false,
  });
  if (error) throw new Error(`Gagal menyimpan surat: ${error.message}`);

  return storedPath;
}

export async function readStoredFile(storedPath: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase.storage.from(BUCKET).download(storedPath);
  if (error || !data) throw new Error(`Gagal membaca dokumen: ${error?.message}`);

  return Buffer.from(await data.arrayBuffer());
}

export const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
