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
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-900 text-slate-100 md:flex">
        <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold">
            BLP
          </span>
          <span className="text-sm font-semibold leading-tight">
            {title}
          </span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-800 px-3 py-4">
          <p className="mb-2 truncate px-3 text-xs text-slate-400">
            {userName}
          </p>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <span className="text-sm font-semibold">{title}</span>
          <LogoutButton />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
