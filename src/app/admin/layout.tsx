import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/DashboardShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const pengajuanBaru = await prisma.application.count({
    where: { status: "DIAJUKAN" },
  });

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "🏠" },
    {
      href: "/admin/pengajuan",
      label: "Pengajuan Magang",
      icon: "📋",
      badge: pengajuanBaru,
    },
    { href: "/admin/peserta", label: "Peserta", icon: "👥" },
    { href: "/admin/jadwal", label: "Jadwal / Ruangan", icon: "📅" },
    { href: "/admin/dokumen", label: "Dokumen", icon: "📄" },
    { href: "/admin/surat", label: "Surat", icon: "✉️" },
    { href: "/admin/penyelesaian", label: "Penyelesaian Magang", icon: "📝" },
    { href: "/admin/email-log", label: "Email Log", icon: "📧" },
    { href: "/admin/pengaturan", label: "Pengaturan", icon: "⚙️" },
    { href: "/admin/audit-log", label: "Audit Log", icon: "🔐" },
  ];

  return (
    <DashboardShell
      navItems={navItems}
      title="Admin Magang"
      userName={session.name}
      pollBadge={{
        href: "/admin/pengajuan",
        url: "/api/admin/applications/pending-count",
        intervalMs: 30000,
      }}
    >
      {children}
    </DashboardShell>
  );
}
