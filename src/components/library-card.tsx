import Image from "next/image";
import Link from "next/link";

import { tmdbImage } from "@/lib/images";
import type { LibraryEntry } from "@/types/library";

/** Tarjeta de una película de la biblioteca: póster, estado, favorita y puntuación. */
export function LibraryCard({
  entry,
  priority = false,
}: {
  entry: LibraryEntry;
  priority?: boolean;
}) {
  const poster = tmdbImage(entry.poster_path, "w342");
  const year = entry.release_date?.slice(0, 4);
  const rating = entry.rating ?? 0;

  return (
    <Link href={`/pelicula/${entry.tmdb_id}`} className="group block rounded-2xl">
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

        <span
          className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-xs font-extrabold ${
            entry.status === "vista"
              ? "bg-ink/90 text-background"
              : "bg-primary text-primary-ink"
          }`}
        >
          {entry.status === "vista" ? "Vista" : "Por ver"}
        </span>

        {entry.is_favorite && (
          <span
            className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-primary text-primary-ink"
            role="img"
            aria-label="Favorita"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
                fill="currentColor"
              />
            </svg>
          </span>
        )}
      </div>

      <h3 className="mt-3 line-clamp-2 font-display text-base font-semibold leading-snug group-hover:underline">
        {entry.title}
      </h3>
      <div className="flex items-center gap-2 text-sm text-muted">
        {year && <span>{year}</span>}
        {rating > 0 && (
          <span
            role="img"
            aria-label={`Tu puntuación: ${rating} de 5`}
            className="tracking-tight text-ink"
          >
            <span aria-hidden="true">
              <span className="text-[#e0a800]">{"★".repeat(rating)}</span>
              <span className="text-ink/25">{"★".repeat(5 - rating)}</span>
            </span>
          </span>
        )}
      </div>
    </Link>
  );
}
