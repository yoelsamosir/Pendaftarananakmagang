import AccountSettingsForm from "@/components/AccountSettingsForm";
import EmailSettingsForm from "@/components/EmailSettingsForm";

export default async function PengaturanPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const isEmailTab = tab === "email";

  return (
    <div>
      <h1 className="text-xl font-serif font-bold text-stone-900">
        {isEmailTab ? "Pengaturan Email" : "Pengaturan Akun"}
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        {isEmailTab
          ? "Kelola alamat email balasan resmi instansi untuk notifikasi sistem."
          : "Kelola nama dan password akun admin Anda."}
      </p>
      <div className="mt-6">
        {isEmailTab ? <EmailSettingsForm /> : <AccountSettingsForm />}
      </div>
    </div>
  );
}
