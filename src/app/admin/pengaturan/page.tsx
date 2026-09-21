import AccountSettingsForm from "@/components/AccountSettingsForm";

export default function PengaturanPage() {
  return (
    <div>
      <h1 className="text-xl font-serif font-bold text-stone-900">Pengaturan Akun</h1>
      <p className="mt-1 text-sm text-stone-500">
        Kelola nama dan password akun admin Anda.
      </p>
      <div className="mt-6">
        <AccountSettingsForm />
      </div>
    </div>
  );
}
