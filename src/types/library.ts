/** Fila de la tabla `library_entries` de Supabase. */

export type LibraryStatus = "por_ver" | "vista";

export interface LibraryEntry {
  id: string;
  user_id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  status: LibraryStatus;
  is_favorite: boolean;
  /** Puntuación de 1 a 5 estrellas */
  rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Datos para crear o actualizar una entrada: solo `tmdb_id` y `title` son obligatorios. */
export type LibraryEntryInput = Pick<LibraryEntry, "tmdb_id" | "title"> &
  Partial<
    Pick<
      LibraryEntry,
      "poster_path" | "release_date" | "status" | "is_favorite" | "rating" | "notes"
    >
  >;
