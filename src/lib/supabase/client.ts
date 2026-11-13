import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para el navegador.
 *
 * La app no tiene login: cada visitante recibe una sesión ANÓNIMA de Supabase
 * (auth.signInAnonymously). Así cada navegador tiene un `user_id` real y las
 * políticas RLS garantizan que solo vea y modifique su propia biblioteca.
 * La clave que se usa es la publishable (anon), segura en el navegador con RLS.
 */

let client: SupabaseClient | null = null;
let sessionPromise: Promise<User> | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en las variables de entorno",
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return client;
}

/**
 * Devuelve el usuario actual y, si el navegador aún no tiene sesión, crea una
 * anónima. Las llamadas simultáneas comparten una sola promesa para no crear
 * usuarios duplicados (por ejemplo con el doble render de React en desarrollo).
 */
export function ensureAnonymousSession(): Promise<User> {
  if (sessionPromise) return sessionPromise;

  sessionPromise = (async () => {
    const supabase = getSupabase();

    const { data: current } = await supabase.auth.getSession();
    if (current.session) return current.session.user;

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) {
      throw new Error(
        error?.message ?? "No se pudo iniciar la sesión anónima en Supabase",
      );
    }
    return data.user;
  })();

  // Si falla, se permite reintentar en la próxima llamada.
  sessionPromise.catch(() => {
    sessionPromise = null;
  });

  return sessionPromise;
}
