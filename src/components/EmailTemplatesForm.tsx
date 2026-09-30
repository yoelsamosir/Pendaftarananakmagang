"use client";

import { useEffect, useState } from "react";
import {
  EMAIL_TEMPLATE_TYPES,
  EMAIL_TEMPLATE_LABEL,
  EMAIL_TEMPLATE_PLACEHOLDERS,
  type EmailTemplateType,
} from "@/lib/emailTemplateConstants";

type Template = { subject: string | null; body: string };

export default function EmailTemplatesForm() {
  const [templates, setTemplates] = useState<Record<EmailTemplateType, Template> | null>(null);
  const [savingType, setSavingType] = useState<EmailTemplateType | null>(null);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/settings/email-templates")
      .then((r) => r.json())
      .then((json) => setTemplates(json.templates))
      .catch(() => {});
  }, []);

  async function handleSave(type: EmailTemplateType) {
    if (!templates) return;
    setSavingType(type);
    setErrors((e) => ({ ...e, [type]: "" }));
    setMessages((m) => ({ ...m, [type]: "" }));
    try {
      const res = await fetch("/api/admin/settings/email-templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          subject: templates[type].subject,
          body: templates[type].body,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan template");
      setMessages((m) => ({ ...m, [type]: "Template berhasil disimpan" }));
    } catch (err) {
      setErrors((e) => ({
        ...e,
        [type]: err instanceof Error ? err.message : "Terjadi kesalahan",
      }));
    } finally {
      setSavingType(null);
    }
  }

  if (!templates) {
    return <p className="text-sm text-stone-500">Memuat template...</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      {EMAIL_TEMPLATE_TYPES.map((type) => (
        <div key={type} className="rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-stone-900">
            {EMAIL_TEMPLATE_LABEL[type]}
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Placeholder yang bisa dipakai:{" "}
            {EMAIL_TEMPLATE_PLACEHOLDERS[type].map((p) => `{{${p}}}`).join(", ")}
          </p>
          {type === "TATA_TERTIB" && (
            <p className="mt-1 text-xs text-stone-500">
              Isi ini otomatis disertakan di bagian bawah email penerimaan
              (Pengajuan Diterima), tidak dikirim sebagai email tersendiri.
            </p>
          )}

          {errors[type] && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors[type]}
            </div>
          )}
          {messages[type] && (
            <div className="mt-3 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {messages[type]}
            </div>
          )}

          <div className="mt-4 space-y-3">
            {type !== "TATA_TERTIB" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Subjek
                </label>
                <input
                  value={templates[type].subject ?? ""}
                  onChange={(e) =>
                    setTemplates((prev) =>
                      prev
                        ? { ...prev, [type]: { ...prev[type], subject: e.target.value } }
                        : prev
                    )
                  }
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">
                Isi Email
              </label>
              <textarea
                value={templates[type].body}
                onChange={(e) =>
                  setTemplates((prev) =>
                    prev ? { ...prev, [type]: { ...prev[type], body: e.target.value } } : prev
                  )
                }
                rows={6}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => handleSave(type)}
              disabled={savingType === type}
              className="rounded-md bg-red-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-900 disabled:opacity-60"
            >
              {savingType === type ? "Menyimpan..." : "Simpan Template"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
