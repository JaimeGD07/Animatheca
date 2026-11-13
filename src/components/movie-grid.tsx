import { MovieCard } from "@/components/movie-card";
import type { MovieSummary } from "@/types/tmdb";

const GRID_CLASSES =
  "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6";

interface MovieGridProps {
  movies: MovieSummary[];
  /** Cuántas tarjetas iniciales cargan su póster con prioridad. */
  priorityCount?: number;
}

export function MovieGrid({ movies, priorityCount = 0 }: MovieGridProps) {
  return (
    <ul className={GRID_CLASSES}>
      {movies.map((movie, index) => (
        <li key={movie.id}>
          <MovieCard movie={movie} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

/** Marcador de posición mientras llegan las películas. */
export function MovieGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Cargando películas…</span>
      <ul className={GRID_CLASSES} aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className="motion-safe:animate-pulse">
            <div className="aspect-[2/3] rounded-2xl bg-ink/10" />
            <div className="mt-3 h-4 w-4/5 rounded-full bg-ink/10" />
            <div className="mt-2 h-3 w-1/3 rounded-full bg-ink/10" />
          </li>
        ))}
      </ul>
    </div>
  );
}
