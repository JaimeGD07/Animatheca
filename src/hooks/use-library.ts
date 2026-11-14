"use client";

import { useCallback, useEffect, useState } from "react";

import { listLibrary } from "@/lib/library";
import type { LibraryEntry } from "@/types/library";

export type LibraryLoadState = "loading" | "ready" | "error";

/**
 * Carga la biblioteca completa del visitante desde Supabase.
 * La usan /biblioteca y /recomendaciones.
 */
export function useLibrary() {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [state, setState] = useState<LibraryLoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    listLibrary()
      .then((data) => {
        if (cancelled) return;
        setEntries(data);
        setState("ready");
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : "Error desconocido");
        setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  /** Vuelve a pedir la biblioteca (por ejemplo, tras un fallo de conexión). */
  const reload = useCallback(() => {
    setState("loading");
    setError(null);
    setReloadKey((key) => key + 1);
  }, []);

  return { entries, state, error, reload };
}
