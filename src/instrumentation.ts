import type { Instrumentation } from "next";

// Pengganti ringan layanan monitoring pihak ketiga (mis. Sentry): setiap
// error tak tertangani di server (route handler, server component, server
// action) otomatis dicatat ke tabel ErrorLog supaya admin bisa memantaunya
// dari halaman /admin tanpa perlu akses log server langsung.
export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  try {
    const { prisma } = await import("@/lib/prisma");
    // Dipotong supaya satu error dengan stack trace sangat panjang (atau
    // pesan yang tanpa sengaja menyertakan data besar) tidak membuat baris
    // ErrorLog tumbuh tak terkendali.
    const message = (err instanceof Error ? err.message : String(err)).slice(0, 1000);
    const stack = err instanceof Error ? err.stack?.slice(0, 4000) ?? null : null;

    await prisma.errorLog.create({
      data: {
        message,
        stack,
        path: request.path,
        method: request.method,
      },
    });
  } catch (loggingError) {
    // Jangan biarkan kegagalan mencatat error justru melempar error baru.
    console.error("Gagal mencatat ErrorLog:", loggingError);
  }

  void context;
};
