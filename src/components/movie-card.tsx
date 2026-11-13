import Image from "next/image";
import Link from "next/link";

import { tmdbImage } from "@/lib/images";
import type { MovieSummary } from "@/types/tmdb";

interface MovieCardProps {
  movie: MovieSummary;
  /** `true` para las primeras tarjetas visibles: carga el póster con prioridad. */
  priority?: boolean;
}

export function MovieCard({ movie, priority = false }: MovieCardProps) {
  const poster = tmdbImage(movie.poster_path, "w342");
  const year = movie.release_date?.slice(0, 4);

  return (
    <Link href={`/pelicula/${movie.id}`} className="group block rounded-2xl">
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition-all duration-200 motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:shadow-lg">
        {poster ? (
          <Image
            src={poster}
            alt=""
            fill
            sizes="(min-width: 1280px) 16vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
            priority={priority}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm font-semibold text-muted">
            Sin póster
          </div>
        )}

        {movie.vote_count > 0 && (
          <span
            className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-ink/90 px-2.5 py-1 text-xs font-extrabold text-background"
            aria-label={`Valoración ${movie.vote_average.toFixed(1)} de 10`}
          >
            <span aria-hidden="true" className="text-star">
              ★
            </span>
            {movie.vote_average.toFixed(1)}
          </span>
        )}
      </div>

      <h3 className="mt-3 line-clamp-2 font-display text-base font-semibold leading-snug group-hover:underline">
        {movie.title}
      </h3>
      {year && <p className="text-sm text-muted">{year}</p>}
    </Link>
  );
}
