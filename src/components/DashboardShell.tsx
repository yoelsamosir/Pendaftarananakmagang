"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

type NavItem = { href: string; label: string; icon: string };

export default function DashboardShell({
  children,
  navItems,
  title,
  userName,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
  userName: string;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-stone-100">
      <aside className="hidden w-64 shrink-0 flex-col bg-red-950 text-stone-100 md:flex">
        <div className="flex items-center gap-2 border-b border-red-900 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/40 bg-red-900 text-sm font-serif font-bold text-amber-300">
            BLP
          </span>
          <span className="font-serif text-sm font-semibold leading-tight text-stone-50">
            {title}
          </span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-stone-300 hover:bg-red-900 hover:text-amber-200"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-red-900 px-3 py-4">
          <p className="mb-2 truncate px-3 text-xs text-stone-400">
            {userName}
          </p>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-400/40 bg-red-900 font-serif text-xs font-bold text-amber-300">
              BLP
            </span>
            <span className="font-serif text-sm font-semibold text-stone-900">{title}</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Buka menu"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 text-stone-700"
          >
            <span className="text-lg leading-none">☰</span>
          </button>
        </header>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-stone-900/50"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-red-950 text-stone-100 shadow-xl">
              <div className="flex items-center justify-between gap-2 border-b border-red-900 px-5 py-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/40 bg-red-900 text-sm font-serif font-bold text-amber-300">
                    BLP
                  </span>
                  <span className="font-serif text-sm font-semibold leading-tight text-stone-50">
                    {title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Tutup menu"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-stone-300 hover:bg-red-900"
                >
                  ✕
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-stone-300 hover:bg-red-900 hover:text-amber-200"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="border-t border-red-900 px-3 py-4">
                <p className="mb-2 truncate px-3 text-xs text-stone-400">
                  {userName}
                </p>
                <LogoutButton />
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
