import { MovieGridSkeleton } from "@/components/movie-grid";

/** Pantalla de carga global: se muestra mientras una ruta se prepara. */
export default function Loading() {
  return (
    <div>
      <div
        aria-hidden="true"
        className="mb-8 h-10 w-56 rounded-full bg-ink/10 motion-safe:animate-pulse"
      />
      <MovieGridSkeleton count={12} />
    </div>
  );
}
