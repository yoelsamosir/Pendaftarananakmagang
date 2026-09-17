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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-sm font-bold text-white">
            BLP
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-slate-900">
              Sistem Magang
            </span>
            <span className="block text-xs text-slate-500">
              Balai Layanan Perpustakaan DIY
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-blue-700">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/daftar"
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Daftar Magang
          </Link>
          <Link
            href="/login"
            className="hidden rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:block"
          >
            Masuk
          </Link>
        </div>
      </div>
    </header>
  );
}
