"use client";

import { useEffect, useId, useState } from "react";

import { getEntry, removeEntry, saveEntry } from "@/lib/library";
import type { LibraryEntry, LibraryEntryInput, LibraryStatus } from "@/types/library";

/** Datos mínimos de la película que se guardan junto a la entrada. */
type MovieRef = Pick<
  LibraryEntryInput,
  "tmdb_id" | "title" | "poster_path" | "release_date"
>;

type LoadState = "loading" | "ready" | "error";

const MAX_NOTES = 1000;

const STATUS_OPTIONS: { value: LibraryStatus; label: string }[] = [
  { value: "por_ver", label: "Por ver" },
  { value: "vista", label: "Vista" },
];

/**
 * Panel de la biblioteca personal dentro del detalle de una película.
 * Es un Client Component: la sesión anónima de Supabase vive en el navegador.
 */
export function LibraryPanel({ movie }: { movie: MovieRef }) {
  const [entry, setEntry] = useState<LibraryEntry | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const notesId = useId();

  // Carga la entrada existente (si la hay) al abrir la película.
  useEffect(() => {
    let cancelled = false;

    getEntry(movie.tmdb_id)
      .then((found) => {
        if (cancelled) return;
        setEntry(found);
        setNotes(found?.notes ?? "");
        setLoadState("ready");
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setLoadError(cause instanceof Error ? cause.message : "Error desconocido");
        setLoadState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [movie.tmdb_id, reloadKey]);

  /** Ejecuta una operación contra Supabase gestionando el estado de carga y los errores. */
  async function run(
    action: () => Promise<LibraryEntry | null>,
    options: { notice?: string; syncNotes?: boolean } = {},
  ) {
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const next = await action();
      setEntry(next);
      if (options.syncNotes) setNotes(next?.notes ?? "");
      if (options.notice) setNotice(options.notice);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar el cambio");
    } finally {
      setPending(false);
    }
  }

  const add = () =>
    run(() => saveEntry({ ...movie, status: "por_ver" }), {
      notice: "Agregada a tu biblioteca",
    });

  const changeStatus = (status: LibraryStatus) =>
    run(() => saveEntry({ ...movie, status }));

  const toggleFavorite = () =>
    run(() => saveEntry({ ...movie, is_favorite: !entry?.is_favorite }));

  const rate = (value: number) => {
    // Pulsar la misma estrella otra vez quita la puntuación.
    const rating = entry?.rating === value ? null : value;
    // Puntuar implica que ya la viste.
    const status = rating !== null && entry?.status !== "vista" ? "vista" : undefined;
    return run(() => saveEntry({ ...movie, rating, ...(status && { status }) }));
  };

  const saveNotes = () =>
    run(() => saveEntry({ ...movie, notes: notes.trim() || null }), {
      notice: "Notas guardadas",
      syncNotes: true,
    });

  const remove = () =>
    run(
      async () => {
        await removeEntry(movie.tmdb_id);
        return null;
      },
      { notice: "Quitada de tu biblioteca", syncNotes: true },
    );

  return (
    <section
      aria-labelledby="library-title"
      className="rounded-3xl border-2 border-ink bg-surface p-5 sm:p-6"
    >
      <h2 id="library-title" className="font-display text-2xl font-bold">
        Mi biblioteca
      </h2>

      {loadState === "loading" && (
        <div role="status" aria-busy="true" className="mt-4 space-y-3 motion-safe:animate-pulse">
          <span className="sr-only">Cargando tu biblioteca…</span>
          <div className="h-10 w-48 rounded-full bg-ink/10" />
          <div className="h-4 w-2/3 rounded-full bg-ink/10" />
        </div>
      )}

      {loadState === "error" && (
        <div role="alert" className="mt-4">
          <p className="font-bold">No pudimos conectar con tu biblioteca.</p>
          <p className="mt-1 text-sm text-muted">{loadError}</p>
          <button
            type="button"
            className="btn btn-ghost mt-4"
            onClick={() => {
              setLoadState("loading");
              setLoadError(null);
              setReloadKey((key) => key + 1);
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {loadState === "ready" && !entry && (
        <div className="mt-3">
          <p className="text-muted">
            Guarda esta película para puntuarla, marcarla como favorita y recibir
            recomendaciones.
          </p>
          <button
            type="button"
            className="btn btn-primary mt-4"
            onClick={add}
            disabled={pending}
          >
            {pending ? "Agregando…" : "Agregar a mi biblioteca"}
          </button>
        </div>
      )}

      {loadState === "ready" && entry && (
        <div className="mt-4 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div role="group" aria-label="Estado" className="flex gap-2">
              {STATUS_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={entry.status === value}
                  disabled={pending}
                  onClick={() => changeStatus(value)}
                  className={`rounded-full border-2 border-ink px-4 py-1.5 text-sm font-extrabold transition-colors disabled:opacity-60 ${
                    entry.status === value ? "bg-ink text-background" : "hover:bg-ink/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              aria-pressed={entry.is_favorite}
              disabled={pending}
              onClick={toggleFavorite}
              className={`inline-flex items-center gap-2 rounded-full border-2 border-ink px-4 py-1.5 text-sm font-extrabold transition-colors disabled:opacity-60 ${
                entry.is_favorite ? "bg-primary text-primary-ink" : "hover:bg-ink/10"
              }`}
            >
              <HeartIcon filled={entry.is_favorite} />
              {entry.is_favorite ? "Favorita" : "Marcar favorita"}
            </button>
          </div>

          <div>
            <p id="rating-label" className="mb-2 text-sm font-bold">
              Tu puntuación
            </p>
            <div role="radiogroup" aria-labelledby="rating-label" className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={entry.rating === value}
                  aria-label={`${value} ${value === 1 ? "estrella" : "estrellas"}`}
                  disabled={pending}
                  onClick={() => rate(value)}
                  className="rounded-md p-0.5 transition-transform hover:scale-110 disabled:opacity-60"
                >
                  <StarIcon filled={(entry.rating ?? 0) >= value} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor={notesId} className="mb-2 block text-sm font-bold">
              Notas
            </label>
            <textarea
              id={notesId}
              value={notes}
              maxLength={MAX_NOTES}
              rows={3}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="¿Qué te pareció? ¿Con quién la viste?"
              className="input !rounded-2xl"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted">
                {notes.length}/{MAX_NOTES}
              </span>
              <button
                type="button"
                className="btn btn-ghost !py-1.5 text-sm"
                disabled={pending || notes.trim() === (entry.notes ?? "")}
                onClick={saveNotes}
              >
                Guardar notas
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="text-sm font-bold text-muted underline underline-offset-4 hover:text-ink disabled:opacity-60"
          >
            Quitar de mi biblioteca
          </button>
        </div>
      )}

      <p role="status" className="mt-4 min-h-5 text-sm font-bold text-accent">
        {notice}
      </p>
      {error && (
        <p role="alert" className="text-sm font-bold text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </section>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2 6.3 20.3l1.2-6.4L2.8 9.5l6.4-.8L12 2.8Z"
        strokeWidth="1.8"
        strokeLinejoin="round"
        className="stroke-ink"
        style={{ fill: filled ? "var(--star)" : "transparent" }}
      />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
        strokeWidth="2"
        strokeLinejoin="round"
        className="stroke-current"
        style={{ fill: filled ? "currentColor" : "transparent" }}
      />
    </svg>
  );
}
