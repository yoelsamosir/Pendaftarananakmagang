"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="font-serif text-3xl font-semibold text-stone-900">Terjadi kesalahan</h1>
      <p className="mt-3 text-stone-600">
        Maaf, halaman ini gagal dimuat. Silakan coba lagi beberapa saat. Jika masalah
        berlanjut, hubungi admin melalui kontak di beranda.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-stone-400">Kode: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-md bg-red-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-900"
        >
          Coba Lagi
        </button>
        <Link
          href="/"
          className="rounded-md border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-100"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
