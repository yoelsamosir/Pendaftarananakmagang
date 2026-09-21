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
  return (
    <div className="flex min-h-screen bg-stone-100">
      <aside className="hidden w-64 shrink-0 flex-col bg-emerald-950 text-stone-100 md:flex">
        <div className="flex items-center gap-2 border-b border-emerald-900 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/40 bg-emerald-900 text-sm font-serif font-bold text-amber-300">
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
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-stone-300 hover:bg-emerald-900 hover:text-amber-200"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-emerald-900 px-3 py-4">
          <p className="mb-2 truncate px-3 text-xs text-stone-400">
            {userName}
          </p>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 md:hidden">
          <span className="font-serif text-sm font-semibold">{title}</span>
          <LogoutButton />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
