"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.get("email") }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Terjadi kesalahan");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <PublicNavbar />
      <div className="mx-auto w-full max-w-sm px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-serif font-bold text-stone-900">Lupa Password</h1>
        <p className="mt-2 text-sm text-stone-600">
          Masukkan email akun Anda. Kami akan mengirim tautan untuk membuat
          password baru.
        </p>

        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {done ? (
          <div className="mt-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Jika email terdaftar, tautan reset password sudah dikirim. Silakan
            cek inbox (dan folder spam) email Anda.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-red-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-900 disabled:opacity-60"
            >
              {loading ? "Mengirim..." : "Kirim Tautan Reset"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-stone-500">
          <Link href="/login" className="font-medium text-red-800">
            Kembali ke halaman masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
