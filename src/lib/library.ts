import { ensureAnonymousSession, getSupabase } from "@/lib/supabase/client";
import type { LibraryEntry, LibraryEntryInput } from "@/types/library";

/**
 * Acceso a la biblioteca personal (tabla `library_entries`).
 * Solo se usa desde Client Components: la sesión anónima vive en el navegador.
 * RLS asegura que cada consulta devuelva únicamente las filas del visitante.
 */

const TABLE = "library_entries";

function fail(message: string): never {
  throw new Error(`Biblioteca: ${message}`);
}

/** Toda la biblioteca del visitante, la más reciente primero. */
export async function listLibrary(): Promise<LibraryEntry[]> {
  await ensureAnonymousSession();
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) fail(error.message);
  return data as LibraryEntry[];
}

/** La entrada de una película concreta, o `null` si aún no está en la biblioteca. */
export async function getEntry(tmdbId: number): Promise<LibraryEntry | null> {
  await ensureAnonymousSession();
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select("*")
    .eq("tmdb_id", tmdbId)
    .maybeSingle();
  if (error) fail(error.message);
  return data as LibraryEntry | null;
}

/**
 * Crea la entrada o actualiza solo los campos enviados
 * (la unicidad es user_id + tmdb_id).
 */
export async function saveEntry(input: LibraryEntryInput): Promise<LibraryEntry> {
  const user = await ensureAnonymousSession();
  const { data, error } = await getSupabase()
    .from(TABLE)
    .upsert({ ...input, user_id: user.id }, { onConflict: "user_id,tmdb_id" })
    .select()
    .single();
  if (error) fail(error.message);
  return data as LibraryEntry;
}

export async function removeEntry(tmdbId: number): Promise<void> {
  await ensureAnonymousSession();
  const { error } = await getSupabase().from(TABLE).delete().eq("tmdb_id", tmdbId);
  if (error) fail(error.message);
}
