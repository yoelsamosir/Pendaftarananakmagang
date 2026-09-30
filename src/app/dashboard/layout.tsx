import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/dashboard/data-saya", label: "Data Saya", icon: "user" },
  { href: "/dashboard/jadwal", label: "Jadwal Magang", icon: "calendar" },
  { href: "/dashboard/dokumen", label: "Dokumen & Surat", icon: "document" },
  { href: "/dashboard/selesai", label: "Pengajuan Selesai Magang", icon: "flag" },
  { href: "/dashboard/akun", label: "Akun Saya", icon: "lock" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "PESERTA") {
    redirect("/login");
  }

  return (
    <DashboardShell navItems={navItems} title="Peserta Magang" userName={session.name}>
      {children}
    </DashboardShell>
  );
}
