import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hoursAgo } from "@/lib/time";
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

  const [pengajuanBaru, errorCount24h] = await Promise.all([
    prisma.application.count({ where: { status: "DIAJUKAN" } }),
    prisma.errorLog.count({
      where: { createdAt: { gte: hoursAgo(24) } },
    }),
  ]);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "🏠" },
    {
      href: "/admin/pengajuan",
      label: "Pengajuan Magang",
      icon: "📋",
      badge: pengajuanBaru,
    },
    {
      href: "/admin/peserta",
      label: "Peserta",
      icon: "👥",
      children: [
        { href: "/admin/peserta", label: "Aktif Magang" },
        { href: "/admin/peserta?tab=alumni", label: "Alumni" },
      ],
    },
    { href: "/admin/jadwal", label: "Jadwal / Ruangan", icon: "📅" },
    { href: "/admin/dokumen", label: "Dokumen", icon: "📄" },
    { href: "/admin/surat", label: "Surat", icon: "✉️" },
    { href: "/admin/email-log", label: "Email Log", icon: "📧" },
    {
      href: "/admin/error-log",
      label: "Error Log",
      icon: "🐞",
      badge: errorCount24h,
    },
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
