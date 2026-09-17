export const INSTANSI_NAME = "Balai Layanan Perpustakaan";
export const INSTANSI_FULL =
  "Balai Layanan Perpustakaan, Dinas Perpustakaan dan Arsip Daerah DIY";

export const APPLICATION_STATUS_LABEL: Record<string, string> = {
  DIAJUKAN: "Diajukan",
  DALAM_VERIFIKASI: "Dalam Verifikasi",
  PERLU_PERBAIKAN: "Perlu Perbaikan",
  DITERIMA: "Diterima",
  DITOLAK: "Ditolak",
  DIBATALKAN: "Dibatalkan",
};

export const APPLICATION_STATUS_COLOR: Record<string, string> = {
  DIAJUKAN: "bg-blue-100 text-blue-700",
  DALAM_VERIFIKASI: "bg-amber-100 text-amber-700",
  PERLU_PERBAIKAN: "bg-orange-100 text-orange-700",
  DITERIMA: "bg-emerald-100 text-emerald-700",
  DITOLAK: "bg-red-100 text-red-700",
  DIBATALKAN: "bg-slate-200 text-slate-600",
};

export const COMPLETION_STATUS_LABEL: Record<string, string> = {
  DIAJUKAN: "Diajukan",
  DISETUJUI: "Disetujui",
  PERLU_PERBAIKAN: "Perlu Perbaikan",
  DITOLAK: "Ditolak",
};

export const COMPLETION_STATUS_COLOR: Record<string, string> = {
  DIAJUKAN: "bg-blue-100 text-blue-700",
  DISETUJUI: "bg-emerald-100 text-emerald-700",
  PERLU_PERBAIKAN: "bg-orange-100 text-orange-700",
  DITOLAK: "bg-red-100 text-red-700",
};

export const DOCUMENT_TYPE_LABEL: Record<string, string> = {
  SURAT_PERMOHONAN: "Surat Izin / Permohonan Magang",
  PROPOSAL: "Proposal Magang",
  PEDOMAN: "Pedoman Magang dari Kampus/Sekolah/Instansi",
  SURAT_PENERIMAAN: "Surat Penerimaan / Balasan Permohonan Magang",
  SURAT_KETERANGAN_SELESAI: "Surat Keterangan Telah Selesai Magang",
  LAINNYA: "Dokumen Lainnya",
};
