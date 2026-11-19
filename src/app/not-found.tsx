import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";

export default function NotFound() {
  return (
    <>
      <PublicNavbar />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-800">404</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-stone-900">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-3 text-stone-600">
          Alamat yang Anda buka tidak tersedia atau sudah dipindahkan. Periksa kembali
          tautannya, atau kembali ke beranda.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-md bg-red-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-900"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/status"
            className="rounded-md border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-100"
          >
            Cek Status Pengajuan
          </Link>
        </div>
      </main>
    </>
  );
}
