"use client";

import { FormEvent, useEffect, useState } from "react";

export default function EmailSettingsForm() {
  const [emailInput, setEmailInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/email")
      .then((r) => r.json())
      .then((json) => setEmailInput(json.email ?? ""))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan email");
      setMessage("Email berhasil diperbarui");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return <p className="text-sm text-stone-500">Memuat pengaturan...</p>;
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-stone-900">
          Email Balasan Resmi Instansi
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Email ini muncul sebagai alamat balasan (reply-to) pada setiap email
          notifikasi yang dikirim sistem ke pemohon/peserta magang.
        </p>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Alamat Email
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-red-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-900 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan Email"}
          </button>
        </form>
      </div>
    </div>
  );
}
