import Link from "next/link";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/#persyaratan", label: "Persyaratan" },
  { href: "/#alur", label: "Alur" },
  { href: "/#faq", label: "FAQ" },
  { href: "/status", label: "Cek Status" },
];

export default function PublicNavbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/40 bg-emerald-900 font-serif text-sm font-bold text-amber-300">
            BLP
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-sm font-semibold text-stone-900">
              Sistem Magang
            </span>
            <span className="block text-xs text-stone-500">
              Balai Layanan Perpustakaan DIY
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-emerald-800">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/daftar"
            className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            Daftar Magang
          </Link>
          <Link
            href="/login"
            className="hidden rounded-md border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 sm:block"
          >
            Masuk
          </Link>
        </div>
      </div>
    </header>
  );
}
