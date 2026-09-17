import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { readStoredFile } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Belum masuk" }, { status: 401 });
  }

  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 });
  }

  if (session.role !== "ADMIN") {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user?.applicationId || user.applicationId !== document.applicationId) {
      return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
    }
  }

  const buffer = await readStoredFile(document.storedPath);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(document.fileName)}"`,
    },
  });
}
