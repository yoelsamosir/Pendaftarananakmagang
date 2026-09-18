import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "🏠" },
  { href: "/admin/pengajuan", label: "Pengajuan Magang", icon: "📋" },
  { href: "/admin/peserta", label: "Peserta", icon: "👥" },
  { href: "/admin/jadwal", label: "Jadwal / Ruangan", icon: "📅" },
  { href: "/admin/dokumen", label: "Dokumen", icon: "📄" },
  { href: "/admin/surat", label: "Surat", icon: "✉️" },
  { href: "/admin/penyelesaian", label: "Penyelesaian Magang", icon: "📝" },
  { href: "/admin/email-log", label: "Email Log", icon: "📧" },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: "⚙️" },
  { href: "/admin/audit-log", label: "Audit Log", icon: "🔐" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <DashboardShell navItems={navItems} title="Admin Magang" userName={session.name}>
      {children}
    </DashboardShell>
  );
}
