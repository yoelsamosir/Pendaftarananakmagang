import type { NextConfig } from "next";

const securityHeaders = [
  // Cegah halaman (login, admin) ditanam di situs lain lewat iframe (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  // Browser wajib mengikuti Content-Type dari server -- penting untuk dokumen
  // unggahan yang disajikan inline lewat /api/files/[id].
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
