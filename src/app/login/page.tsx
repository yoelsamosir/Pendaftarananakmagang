"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal masuk");

      const next = params.get("next");
      if (next) {
        router.push(next);
      } else {
        router.push(json.role === "ADMIN" ? "/admin" : "/dashboard");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-serif font-bold text-stone-900">Masuk</h1>
      <p className="mt-2 text-sm text-stone-600">
        Untuk peserta yang sudah diterima dan admin sistem.
      </p>

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-stone-700">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-medium text-emerald-800">
              Lupa password?
            </Link>
          </div>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-emerald-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Belum pernah mendaftar?{" "}
        <Link href="/daftar" className="font-medium text-emerald-800">
          Ajukan magang
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col">
      <PublicNavbar />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
