import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

// Simpan file di luar /public agar tidak bisa diakses langsung lewat URL publik.
// Semua akses dokumen wajib melalui route API /api/files/[id] yang memeriksa hak akses.
const STORAGE_ROOT = path.join(process.cwd(), "storage");

export async function saveUploadedFile(file: File, subDir: string) {
  const dir = path.join(STORAGE_ROOT, subDir);
  await fs.mkdir(dir, { recursive: true });

  const ext = path.extname(file.name) || "";
  const key = `${randomUUID()}${ext}`;
  const fullPath = path.join(dir, key);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  return {
    storedPath: path.join(subDir, key).replace(/\\/g, "/"),
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: buffer.length,
  };
}

export async function saveGeneratedFile(
  buffer: Buffer,
  subDir: string,
  fileName: string
) {
  const dir = path.join(STORAGE_ROOT, subDir);
  await fs.mkdir(dir, { recursive: true });
  const key = `${randomUUID()}-${fileName}`;
  const fullPath = path.join(dir, key);
  await fs.writeFile(fullPath, buffer);
  return path.join(subDir, key).replace(/\\/g, "/");
}

export async function readStoredFile(storedPath: string) {
  const fullPath = path.join(STORAGE_ROOT, storedPath);
  return fs.readFile(fullPath);
}

export const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
