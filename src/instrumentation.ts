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
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack ?? null : null;

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
