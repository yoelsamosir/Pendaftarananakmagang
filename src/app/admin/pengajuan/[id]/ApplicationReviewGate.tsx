"use client";

import { useState } from "react";
import { DOCUMENT_TYPE_LABEL } from "@/lib/constants";
import DecisionPanel from "./DecisionPanel";

type Doc = { id: string; type: string; fileName: string };

// Membungkus daftar dokumen pemohon + DecisionPanel supaya keduanya berbagi
// state "dokumen mana yang sudah dibuka admin" -- bug MAG-2026-0017: admin
// bisa langsung klik Terima tanpa pernah membuka dokumen yang diunggah
// pemohon. Ini gate proses kerja di sisi client, bukan batas keamanan.
export default function ApplicationReviewGate({
  documents,
  applicationId,
  status,
  nomorSuratAsal,
  tanggalSuratAsal,
  existingAccountNote,
}: {
  documents: Doc[];
  applicationId: string;
  status: string;
  nomorSuratAsal?: string | null;
  tanggalSuratAsal?: string | null;
  existingAccountNote?: { tone: "conflict" | "info"; message: string } | null;
}) {
  const [viewed, setViewed] = useState<Set<string>>(new Set());
  const allDocumentsReviewed = documents.length === 0 || documents.every((d) => viewed.has(d.id));

  function markViewed(id: string) {
    setViewed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-lg border border-stone-200 bg-white p-5 lg:col-span-2">
        <h2 className="text-sm font-semibold text-stone-900">Dokumen</h2>
        <ul className="mt-3 divide-y divide-stone-100">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="text-stone-800">
                  {DOCUMENT_TYPE_LABEL[doc.type] ?? doc.type}
                </p>
                <p className="text-xs text-stone-400">{doc.fileName}</p>
              </div>
              <a
                href={`/api/files/${doc.id}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => markViewed(doc.id)}
                className={`text-sm font-medium hover:underline ${
                  viewed.has(doc.id) ? "text-stone-500" : "text-red-800"
                }`}
              >
                {viewed.has(doc.id) ? "✓ Sudah dilihat" : "Lihat"}
              </a>
            </li>
          ))}
          {documents.length === 0 && (
            <li className="py-3 text-sm text-stone-400">Belum ada dokumen.</li>
          )}
        </ul>
      </div>

      <div>
        <DecisionPanel
          applicationId={applicationId}
          status={status}
          nomorSuratAsal={nomorSuratAsal}
          tanggalSuratAsal={tanggalSuratAsal}
          existingAccountNote={existingAccountNote}
          allDocumentsReviewed={allDocumentsReviewed}
        />
      </div>
    </div>
  );
}
