"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import LogoutButton from "./LogoutButton";

type NavChild = { href: string; label: string };
type NavItem = { href: string; label: string; icon: string; badge?: number; children?: NavChild[] };
type PollBadge = { href: string; url: string; intervalMs?: number };

function isActivePath(pathname: string, href: string) {
  const path = href.split("?")[0];
  if (path === "/admin" || path === "/dashboard") return pathname === path;
  return pathname === path || pathname.startsWith(`${path}/`);
}

// Anak-menu dibedakan lewat query string (mis. ?tab=alumni), bukan path --
// child tanpa query dianggap kondisi default ("tab" tidak ada di URL).
function isChildActive(pathname: string, searchParams: URLSearchParams, childHref: string) {
  const [childPath, childQuery] = childHref.split("?");
  if (pathname !== childPath) return false;
  if (!childQuery) return !searchParams.get("tab");
  const childParams = new URLSearchParams(childQuery);
  for (const [key, value] of childParams) {
    if (searchParams.get(key) !== value) return false;
  }
  return true;
}

export default function DashboardShell({
  children,
  navItems,
  title,
  userName,
  pollBadge,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
  userName: string;
  pollBadge?: PollBadge;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [polledBadge, setPolledBadge] = useState<number | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Submenu tertutup secara default -- hanya terbuka kalau baris induknya
  // sedang aktif (sudah di halaman itu) atau admin baru mengekliknya sendiri,
  // bukan otomatis terbuka semua setiap saat.
  const [openHrefs, setOpenHrefs] = useState<Set<string>>(
    () => new Set(navItems.filter((item) => item.children && isActivePath(pathname, item.href)).map((item) => item.href))
  );

  function toggleOpen(href: string) {
    setOpenHrefs((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  }

  useEffect(() => {
    if (!pollBadge) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(pollBadge.url);
        if (!res.ok || cancelled) return;
        const json = await res.json();
        if (!cancelled) setPolledBadge(json.count);
      } catch {
        // abaikan kegagalan polling, badge tetap pakai nilai terakhir
      }
    };
    const id = setInterval(tick, pollBadge.intervalMs ?? 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pollBadge]);

  const items = navItems.map((item) =>
    pollBadge && item.href === pollBadge.href && polledBadge !== null
      ? { ...item, badge: polledBadge }
      : item
  );

  return (
    <div className="flex min-h-screen bg-stone-100">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-red-950 text-stone-100 md:flex">
        <div className="flex shrink-0 items-center gap-2 border-b border-red-900 px-5 py-5">
          <span className="flex h-9 items-center rounded-md bg-stone-50 px-2 py-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-sidebar.svg"
              alt="Balai Layanan Perpustakaan"
              className="h-6 w-auto"
            />
          </span>
          <span className="font-serif text-sm font-semibold leading-tight text-stone-50">
            {title}
          </span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const active = isActivePath(pathname, item.href);
            const open = item.children ? openHrefs.has(item.href) : false;
            return (
              <div key={item.href}>
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (item.children) {
                        setOpenHrefs((prev) => new Set(prev).add(item.href));
                      }
                    }}
                    className={`flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                      active
                        ? "bg-white/10 text-amber-200"
                        : "text-stone-300 hover:bg-red-900 hover:text-amber-200"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {!!item.badge && (
                      <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-red-950">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                  {item.children && (
                    <button
                      type="button"
                      onClick={() => toggleOpen(item.href)}
                      aria-label={open ? "Tutup submenu" : "Buka submenu"}
                      className="mr-1 flex h-8 w-8 items-center justify-center text-stone-400 hover:text-amber-200"
                    >
                      <span
                        className={`inline-block text-xs transition-transform ${open ? "rotate-90" : ""}`}
                      >
                        ▶
                      </span>
                    </button>
                  )}
                </div>
                {item.children && open && (
                  <div className="ml-6 mt-1 space-y-1 border-l border-red-900/60 pl-3">
                    {item.children.map((child) => {
                      const childActive = isChildActive(pathname, searchParams, child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block rounded-md px-3 py-1.5 text-xs font-medium ${
                            childActive
                              ? "text-amber-200"
                              : "text-stone-400 hover:text-amber-200"
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="shrink-0 border-t border-red-900 px-3 py-4">
          <p className="mb-2 truncate px-3 text-xs text-stone-400">
            {userName}
          </p>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-sidebar.svg"
              alt="Balai Layanan Perpustakaan"
              className="h-6 w-auto"
            />
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
                  <span className="flex h-9 items-center rounded-md bg-stone-50 px-2 py-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/logo-sidebar.svg"
                      alt="Balai Layanan Perpustakaan"
                      className="h-6 w-auto"
                    />
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
                {items.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  const open = item.children ? openHrefs.has(item.href) : false;
                  return (
                    <div key={item.href}>
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          onClick={() => {
                            if (item.children) {
                              setOpenHrefs((prev) => new Set(prev).add(item.href));
                            } else {
                              setMobileNavOpen(false);
                            }
                          }}
                          className={`flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                            active
                              ? "bg-white/10 text-amber-200"
                              : "text-stone-300 hover:bg-red-900 hover:text-amber-200"
                          }`}
                        >
                          <span>{item.icon}</span>
                          <span className="flex-1">{item.label}</span>
                          {!!item.badge && (
                            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-red-950">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                        {item.children && (
                          <button
                            type="button"
                            onClick={() => toggleOpen(item.href)}
                            aria-label={open ? "Tutup submenu" : "Buka submenu"}
                            className="mr-1 flex h-8 w-8 items-center justify-center text-stone-400 hover:text-amber-200"
                          >
                            <span
                              className={`inline-block text-xs transition-transform ${open ? "rotate-90" : ""}`}
                            >
                              ▶
                            </span>
                          </button>
                        )}
                      </div>
                      {item.children && open && (
                        <div className="ml-6 mt-1 space-y-1 border-l border-red-900/60 pl-3">
                          {item.children.map((child) => {
                            const childActive = isChildActive(pathname, searchParams, child.href);
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setMobileNavOpen(false)}
                                className={`block rounded-md px-3 py-1.5 text-xs font-medium ${
                                  childActive
                                    ? "text-amber-200"
                                    : "text-stone-400 hover:text-amber-200"
                                }`}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
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
