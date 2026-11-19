"use client";

// Fallback terakhir kalau root layout sendiri gagal dirender. Tidak memakai
// globals.css (lihat dokumentasi global-error), jadi gayanya inline.
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#fafaf9",
          color: "#1c1917",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 16px",
        }}
      >
        <title>Terjadi kesalahan | Sistem Magang</title>
        <div>
          <h1 style={{ fontSize: 28, margin: 0 }}>Terjadi kesalahan</h1>
          <p style={{ color: "#57534e" }}>
            Maaf, sistem sedang mengalami gangguan. Silakan coba lagi beberapa saat.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 16,
              background: "#991b1b",
              color: "#fff",
              border: 0,
              borderRadius: 6,
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
