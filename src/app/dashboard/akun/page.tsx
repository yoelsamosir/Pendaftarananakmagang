import AccountSettingsForm from "@/components/AccountSettingsForm";

export default function AkunSayaPage() {
  return (
    <div>
      <h1 className="text-xl font-serif font-bold text-stone-900">Akun Saya</h1>
      <p className="mt-1 text-sm text-stone-500">
        Kelola nama dan password akun Anda.
      </p>
      <div className="mt-6">
        <AccountSettingsForm />
      </div>
    </div>
  );
}
