const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export type TmdbImageSize = "w185" | "w342" | "w500" | "w780" | "original";

/** URL completa de un póster o fondo de TMDB; `null` si la película no tiene imagen. */
export function tmdbImage(
  path: string | null | undefined,
  size: TmdbImageSize = "w500",
): string | null {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
}
