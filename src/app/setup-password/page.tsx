"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PublicNavbar from "@/components/PublicNavbar";

function SetupPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      if (!token) throw new Error("Tautan tidak valid");
      const res = await fetch("/api/auth/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: formData.get("password"),
          confirmPassword: formData.get("confirmPassword"),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan password");
      setDone(true);
      const next = json.role === "ADMIN" ? "/admin" : "/dashboard";
      setTimeout(() => {
        router.push(next);
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <p className="text-emerald-600">
          Password berhasil dibuat. Mengalihkan ke dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Buat Password</h1>
      <p className="mt-2 text-sm text-slate-600">
        Buat password baru untuk mengaktifkan akun Anda.
      </p>

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Password Baru
          </label>
          <input
            name="password"
            type="password"
            minLength={8}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Konfirmasi Password
          </label>
          <input
            name="confirmPassword"
            type="password"
            minLength={8}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan Password"}
        </button>
      </form>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <div className="flex min-h-full flex-col">
      <PublicNavbar />
      <Suspense fallback={null}>
        <SetupPasswordForm />
      </Suspense>
    </div>
  );
}
