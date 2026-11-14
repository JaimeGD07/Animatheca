import "server-only";

import { cacheLife } from "next/cache";

import type {
  MovieDetail,
  MovieSummary,
  Paginated,
} from "@/types/tmdb";

/**
 * Cliente de TMDB que SOLO corre en el servidor.
 * El token (TMDB_ACCESS_TOKEN) nunca llega al navegador: `server-only`
 * hace fallar el build si algún Client Component importa este archivo.
 */

const BASE_URL = "https://api.themoviedb.org/3";
const LANGUAGE = "es-MX";

/** ID del género "Animación" en TMDB. */
export const ANIMATION_GENRE_ID = 16;

export class TmdbError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "TmdbError";
    this.status = status;
  }
}

type Params = Record<string, string | number | boolean | undefined>;

type TmdbResult<T> = { ok: true; data: T } | { ok: false; status: number };

/**
 * Pide un recurso a TMDB y lo cachea durante horas con `use cache`
 * (Cache Components de Next 16), así que no gastamos cuota en cada visita.
 *
 * IMPORTANTE: esta función NO lanza errores. En producción, un error lanzado
 * dentro de `use cache` llega al otro lado como un `Error` genérico sin `name`
 * ni `status`, y no podríamos distinguir un 404 de un fallo real. Por eso
 * devuelve un resultado y `tmdbFetch` lanza el `TmdbError` fuera de la caché.
 * Los fallos se guardan solo unos segundos: un 500 puntual no debe durar horas.
 */
async function cachedTmdbFetch<T>(
  path: string,
  params: Params,
  token: string,
): Promise<TmdbResult<T>> {
  "use cache";
  cacheLife("hours");

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("language", LANGUAGE);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
    });
  } catch {
    cacheLife("seconds");
    return { ok: false, status: 503 };
  }

  if (!response.ok) {
    cacheLife("seconds");
    return { ok: false, status: response.status };
  }
  return { ok: true, data: (await response.json()) as T };
}

async function tmdbFetch<T>(path: string, params: Params = {}): Promise<T> {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token) {
    throw new TmdbError("Falta TMDB_ACCESS_TOKEN en las variables de entorno", 500);
  }

  const result = await cachedTmdbFetch<T>(path, params, token);
  if (!result.ok) {
    // Un fallo del lado de TMDB (5xx) se reporta como 502 para no confundirlo
    // con nuestros propios errores de configuración (500).
    const status = result.status >= 500 ? 502 : result.status;
    throw new TmdbError(`TMDB respondió con estado ${result.status}`, status);
  }
  return result.data;
}

export interface DiscoverOptions {
  page?: number;
  year?: number;
  sortBy?: "popularity.desc" | "vote_average.desc";
}

/** Películas del género Animación, con filtros opcionales. */
export function discoverAnimated({
  page = 1,
  year,
  sortBy = "popularity.desc",
}: DiscoverOptions = {}): Promise<Paginated<MovieSummary>> {
  return tmdbFetch<Paginated<MovieSummary>>("/discover/movie", {
    with_genres: ANIMATION_GENRE_ID,
    include_adult: false,
    sort_by: sortBy,
    // Sin un mínimo de votos, "mejor valoradas" se llena de títulos con 1 voto.
    "vote_count.gte": sortBy === "vote_average.desc" ? 300 : undefined,
    primary_release_year: year,
    page,
  });
}

export const getPopular = (page = 1, year?: number) =>
  discoverAnimated({ page, year, sortBy: "popularity.desc" });

export const getTopRated = (page = 1, year?: number) =>
  discoverAnimated({ page, year, sortBy: "vote_average.desc" });

/**
 * Búsqueda por texto. El endpoint /search/movie no filtra por género,
 * así que descartamos lo que no sea animación (una página puede traer
 * menos de 20 resultados).
 */
export async function searchAnimated(
  query: string,
  page = 1,
  year?: number,
): Promise<Paginated<MovieSummary>> {
  const data = await tmdbFetch<Paginated<MovieSummary>>("/search/movie", {
    query,
    page,
    include_adult: false,
    primary_release_year: year,
  });
  return {
    ...data,
    results: data.results.filter((movie) =>
      movie.genre_ids.includes(ANIMATION_GENRE_ID),
    ),
  };
}

/** Detalle de una película con tráilers y recomendaciones incluidos. */
export function getMovieDetail(id: number): Promise<MovieDetail> {
  return tmdbFetch<MovieDetail>(`/movie/${id}`, {
    append_to_response: "videos,recommendations",
    include_video_language: "es,en,null",
  });
}

export interface RecommendationOptions {
  /** Películas que el usuario puntuó alto: se usan como semilla. */
  seedIds: number[];
  /** Películas que ya tiene en su biblioteca: no se recomiendan. */
  excludeIds?: number[];
  limit?: number;
}

/**
 * Recomendaciones personalizadas: pide las recomendaciones de TMDB para cada
 * película semilla y las combina. Una película sugerida por varias semillas
 * sube en el ranking; el desempate lo da su valoración promedio.
 */
export async function getRecommendationsFor({
  seedIds,
  excludeIds = [],
  limit = 20,
}: RecommendationOptions): Promise<MovieSummary[]> {
  const seeds = seedIds.slice(0, 5);
  const lists = await Promise.all(
    seeds.map((id) =>
      tmdbFetch<Paginated<MovieSummary>>(`/movie/${id}/recommendations`),
    ),
  );

  const excluded = new Set([...seedIds, ...excludeIds]);
  const scored = new Map<number, { movie: MovieSummary; score: number }>();

  for (const list of lists) {
    for (const movie of list.results) {
      if (excluded.has(movie.id)) continue;
      if (!movie.genre_ids.includes(ANIMATION_GENRE_ID)) continue;

      const entry = scored.get(movie.id) ?? { movie, score: 0 };
      entry.score += 1 + movie.vote_average / 10;
      scored.set(movie.id, entry);
    }
  }

  return [...scored.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.movie);
}
