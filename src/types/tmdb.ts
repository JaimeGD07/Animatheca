/** Tipos de las respuestas de TMDB que usa la app (solo los campos que necesitamos). */

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface MovieSummary {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
}

export interface Paginated<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface MovieVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface MovieDetail extends Omit<MovieSummary, "genre_ids"> {
  genres: TmdbGenre[];
  runtime: number | null;
  tagline: string;
  status: string;
  homepage: string;
  videos: { results: MovieVideo[] };
  recommendations: Paginated<MovieSummary>;
}

export type MovieCategory = "popular" | "top_rated";
