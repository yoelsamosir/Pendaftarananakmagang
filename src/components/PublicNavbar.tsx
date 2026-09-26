"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/#layanan", label: "Layanan" },
  { href: "/#persyaratan", label: "Persyaratan" },
  { href: "/#alur", label: "Alur" },
  { href: "/#faq", label: "FAQ" },
  { href: "/status", label: "Cek Status" },
  { href: "/login", label: "Masuk" },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/40 bg-red-900 font-serif text-sm font-bold text-amber-300">
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
          {links
            .filter((l) => l.label !== "Masuk")
            .map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-red-800">
                {l.label}
              </Link>
            ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/daftar"
            className="rounded-md bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900"
          >
            Daftar Magang
          </Link>
          <Link
            href="/login"
            className="hidden rounded-md border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 md:block"
          >
            Masuk
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 text-stone-700 md:hidden"
          >
            <span className="text-lg leading-none">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-stone-200 bg-stone-50 px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-red-800"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
