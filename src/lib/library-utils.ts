import type { LibraryEntry } from "@/types/library";

/** Funciones puras para filtrar, ordenar y resumir la biblioteca. */

export type LibraryFilter = "todas" | "por_ver" | "vistas" | "favoritas";
export type LibrarySort = "recientes" | "puntuacion" | "titulo" | "anio";

/** Minúsculas y sin tildes, para que "pelicula" encuentre "Película". */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function matchesFilter(entry: LibraryEntry, filter: LibraryFilter): boolean {
  switch (filter) {
    case "por_ver":
      return entry.status === "por_ver";
    case "vistas":
      return entry.status === "vista";
    case "favoritas":
      return entry.is_favorite;
    default:
      return true;
  }
}

/** Cuántas entradas hay en cada filtro (para mostrarlo en los botones). */
export function countByFilter(entries: LibraryEntry[]): Record<LibraryFilter, number> {
  return {
    todas: entries.length,
    por_ver: entries.filter((entry) => matchesFilter(entry, "por_ver")).length,
    vistas: entries.filter((entry) => matchesFilter(entry, "vistas")).length,
    favoritas: entries.filter((entry) => matchesFilter(entry, "favoritas")).length,
  };
}

interface ViewOptions {
  filter: LibraryFilter;
  sort: LibrarySort;
  query: string;
}

/** Aplica filtro, búsqueda por título y orden. No modifica el arreglo original. */
export function filterAndSort(
  entries: LibraryEntry[],
  { filter, sort, query }: ViewOptions,
): LibraryEntry[] {
  const needle = normalizeText(query);

  const visible = entries.filter(
    (entry) =>
      matchesFilter(entry, filter) &&
      (needle === "" || normalizeText(entry.title).includes(needle)),
  );

  const byRecent = (a: LibraryEntry, b: LibraryEntry) =>
    b.updated_at.localeCompare(a.updated_at);

  switch (sort) {
    case "puntuacion":
      // Sin puntuar al final; a igual puntuación, la más reciente primero.
      return visible.sort(
        (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || byRecent(a, b),
      );
    case "titulo":
      return visible.sort((a, b) => a.title.localeCompare(b.title, "es"));
    case "anio":
      // Más nuevas primero; sin fecha al final.
      return visible.sort(
        (a, b) =>
          (b.release_date ?? "").localeCompare(a.release_date ?? "") || byRecent(a, b),
      );
    default:
      return visible.sort(byRecent);
  }
}

export interface LibraryStats {
  total: number;
  seen: number;
  pending: number;
  favorites: number;
  /** Promedio de tus puntuaciones (1 a 5), o `null` si aún no puntúas nada. */
  averageRating: number | null;
}

export function computeStats(entries: LibraryEntry[]): LibraryStats {
  const rated = entries.filter((entry) => entry.rating !== null);
  const sum = rated.reduce((total, entry) => total + (entry.rating ?? 0), 0);

  return {
    total: entries.length,
    seen: entries.filter((entry) => entry.status === "vista").length,
    pending: entries.filter((entry) => entry.status === "por_ver").length,
    favorites: entries.filter((entry) => entry.is_favorite).length,
    averageRating: rated.length > 0 ? sum / rated.length : null,
  };
}

export interface SeedSelection {
  seeds: LibraryEntry[];
  /** De dónde salen las semillas: películas muy puntuadas o, si no hay, favoritas. */
  reason: "rating" | "favorites" | "none";
}

/**
 * Elige las películas que sirven de base para recomendar (máximo `max`):
 * primero las puntuadas con 4 o 5 estrellas; si no hay, las favoritas.
 */
export function pickSeeds(entries: LibraryEntry[], max = 5): SeedSelection {
  const byRecent = (a: LibraryEntry, b: LibraryEntry) =>
    b.updated_at.localeCompare(a.updated_at);

  const liked = entries
    .filter((entry) => (entry.rating ?? 0) >= 4)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || byRecent(a, b));
  if (liked.length > 0) return { seeds: liked.slice(0, max), reason: "rating" };

  const favorites = entries.filter((entry) => entry.is_favorite).sort(byRecent);
  if (favorites.length > 0) return { seeds: favorites.slice(0, max), reason: "favorites" };

  return { seeds: [], reason: "none" };
}
