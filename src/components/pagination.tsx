import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Construye la URL de una página conservando los filtros activos. */
  hrefFor: (page: number) => string;
}

export function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      aria-label="Paginación"
      className="mt-12 flex items-center justify-center gap-4"
    >
      {hasPrevious ? (
        <Link href={hrefFor(page - 1)} className="btn btn-ghost" rel="prev">
          ← Anterior
        </Link>
      ) : (
        <span className="btn btn-ghost pointer-events-none opacity-40" aria-hidden="true">
          ← Anterior
        </span>
      )}

      <p className="text-sm font-bold text-muted">
        Página {page} de {totalPages}
      </p>

      {hasNext ? (
        <Link href={hrefFor(page + 1)} className="btn btn-ghost" rel="next">
          Siguiente →
        </Link>
      ) : (
        <span className="btn btn-ghost pointer-events-none opacity-40" aria-hidden="true">
          Siguiente →
        </span>
      )}
    </nav>
  );
}
