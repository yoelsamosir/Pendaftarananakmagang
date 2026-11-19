export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-20" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-stone-300 border-t-red-800" />
      <span className="sr-only">Memuat…</span>
    </div>
  );
}
