import Link from "next/link";

export default function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-stone-600">
      <p>
        Halaman {page} dari {totalPages}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1)}
            className="rounded-md border border-stone-300 bg-white px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-50"
          >
            Sebelumnya
          </Link>
        ) : (
          <span className="rounded-md border border-stone-200 px-3 py-1.5 text-stone-300">
            Sebelumnya
          </span>
        )}
        {page < totalPages ? (
          <Link
            href={buildHref(page + 1)}
            className="rounded-md border border-stone-300 bg-white px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-50"
          >
            Selanjutnya
          </Link>
        ) : (
          <span className="rounded-md border border-stone-200 px-3 py-1.5 text-stone-300">
            Selanjutnya
          </span>
        )}
      </div>
    </div>
  );
}
