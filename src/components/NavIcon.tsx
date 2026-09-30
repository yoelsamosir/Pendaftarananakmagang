// Ikon garis minimalis untuk menu sidebar, menggantikan emoji supaya warnanya
// ikut mengikuti state teks di sekitarnya (aktif/hover) lewat currentColor,
// sesuatu yang tidak bisa dilakukan emoji.
const paths: Record<string, React.ReactNode> = {
  home: (
    <>
      <path d="M3 10.5 10 4l7 6.5" />
      <path d="M5 9v7h10V9" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 4h12v8.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z" />
      <path d="M4 10h3.5l1 2h3l1-2H16" />
    </>
  ),
  users: (
    <>
      <circle cx="7" cy="7" r="2.5" />
      <circle cx="13.5" cy="7.5" r="2" />
      <path d="M2.5 16c0-2.6 2-4.3 4.5-4.3s4.5 1.7 4.5 4.3" />
      <path d="M11 12c1.9.2 3.5 1.6 3.5 4" />
    </>
  ),
  user: (
    <>
      <circle cx="10" cy="6.5" r="3" />
      <path d="M4 16c0-3 2.7-5 6-5s6 2 6 5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="14" height="13" rx="1.5" />
      <path d="M3 8h14" />
      <path d="M7 2.5v3M13 2.5v3" />
    </>
  ),
  document: (
    <>
      <path d="M6 2.5h5.5l3 3v11.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-13.5a1 1 0 0 1 1-1Z" />
      <path d="M11.5 2.5v3h3" />
      <path d="M7 10.5h6M7 13.5h6" />
    </>
  ),
  envelope: (
    <>
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" />
      <path d="M3 5.5l7 5.5 7-5.5" />
    </>
  ),
  paperAirplane: <path d="M3 10 17 3.5l-5 14-2.5-5.5L3 10Z" />,
  flag: (
    <>
      <path d="M5 2.5v15" />
      <path d="M5 3.5h9l-2.5 3 2.5 3H5" />
    </>
  ),
  warningTriangle: (
    <>
      <path d="M10 3l8 14H2L10 3Z" />
      <path d="M10 8.5v3.5" />
      <circle cx="10" cy="14.3" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  cog: (
    <>
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.1 4.9l-1.4 1.4M6.3 13.7l-1.4 1.4M15.1 15.1l-1.4-1.4M6.3 6.3 4.9 4.9" />
    </>
  ),
  shield: (
    <>
      <path d="M10 2.5 16 5v4.5c0 4-2.8 6.8-6 8-3.2-1.2-6-4-6-8V5l6-2.5Z" />
      <path d="M7.3 10 9.1 11.8 12.7 8.2" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="9" width="11" height="8" rx="1.5" />
      <path d="M6.5 9V6a3.5 3.5 0 0 1 7 0v3" />
    </>
  ),
};

export default function NavIcon({ name, className }: { name: string; className?: string }) {
  const path = paths[name];
  if (!path) return null;
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}
