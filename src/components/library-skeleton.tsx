import { MovieGridSkeleton } from "@/components/movie-grid";

/**
 * Marcador de posición de /biblioteca con la misma estructura que la vista final
 * (resumen, filtros y tarjetas), para que la página no salte al cargar los datos.
 */
export function LibrarySkeleton() {
  return (
    <div role="status" aria-live="polite" className="motion-safe:animate-pulse">
      <span className="sr-only">Cargando tu biblioteca…</span>
      <div aria-hidden="true">
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-[5.25rem] rounded-2xl bg-ink/10" />
          ))}
        </div>
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-9 w-24 rounded-full bg-ink/10" />
          ))}
        </div>
        <MovieGridSkeleton count={6} />
      </div>
    </div>
  );
}
