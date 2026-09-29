"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUnmetPasswordRules } from "@/lib/passwordRules";

export default function AccountSettingsForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const unmetPasswordRules = getUnmetPasswordRules(newPassword);
  const newPasswordsMatch = newPassword.length > 0 && newPassword === confirmNewPassword;

  useEffect(() => {
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((json) => {
        setProfile(json.profile);
        setNameInput(json.profile?.name ?? "");
      })
      .catch(() => {});
  }, []);

  async function handleProfileSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileError(null);
    setProfileMessage(null);
    setSavingProfile(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan nama");
      setProfileMessage("Nama berhasil diperbarui");
      router.refresh();
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);
    setSavingPassword(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.get("currentPassword"),
          newPassword: formData.get("newPassword"),
          confirmPassword: formData.get("confirmPassword"),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengubah password");
      setPasswordMessage("Password berhasil diubah");
      form.reset();
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSavingPassword(false);
    }
  }

  if (!profile) {
    return <p className="text-sm text-stone-500">Memuat data akun...</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-stone-900">Profil</h2>
        <p className="mt-1 text-sm text-stone-500">Email: {profile.email}</p>

        {profileError && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {profileError}
          </div>
        )}
        {profileMessage && (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {profileMessage}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Nama Lengkap
            </label>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              required
              minLength={3}
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="rounded-md bg-red-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-900 disabled:opacity-60"
          >
            {savingProfile ? "Menyimpan..." : "Simpan Nama"}
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-stone-900">Ubah Password</h2>

        {passwordError && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {passwordError}
          </div>
        )}
        {passwordMessage && (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {passwordMessage}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Password Saat Ini
            </label>
            <input
              name="currentPassword"
              type="password"
              required
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Password Baru
            </label>
            <input
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
            />
            {newPassword.length > 0 && unmetPasswordRules.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-xs text-stone-500">
                {unmetPasswordRules.map((rule) => (
                  <li key={rule.message} className="text-red-600">
                    &bull; {rule.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Konfirmasi Password Baru
            </label>
            <input
              name="confirmPassword"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
            />
            {confirmNewPassword.length > 0 && !newPasswordsMatch && (
              <p className="mt-2 text-xs text-red-600">Konfirmasi password tidak sama</p>
            )}
          </div>
          <button
            type="submit"
            disabled={
              savingPassword || unmetPasswordRules.length > 0 || !newPasswordsMatch
            }
            className="rounded-md bg-red-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-900 disabled:opacity-60"
          >
            {savingPassword ? "Menyimpan..." : "Ubah Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
