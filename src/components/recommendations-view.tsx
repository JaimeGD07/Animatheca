"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LibraryError } from "@/components/library-error";
import { MovieGrid, MovieGridSkeleton } from "@/components/movie-grid";
import { useLibrary } from "@/hooks/use-library";
import { pickSeeds } from "@/lib/library-utils";
import type { MovieSummary } from "@/types/tmdb";

/** Resultado de una petición, asociado a la clave que la originó. */
type Fetched = { key: string; movies: MovieSummary[] } | { key: string; error: string };

/**
 * Vista de /recomendaciones. Lee tu biblioteca (Supabase, en el navegador) y pide a
 * /api/recommendations sugerencias basadas en lo que puntuaste alto.
 */
export function RecommendationsView() {
  const { entries, state, error, reload } = useLibrary();

  const { seeds, reason } = useMemo(() => pickSeeds(entries), [entries]);
  const seedKey = seeds.map((seed) => seed.tmdb_id).join(",");
  // Lo que ya tienes en tu biblioteca no se vuelve a recomendar (la API admite hasta 200).
  const excludeKey = entries
    .slice(0, 200)
    .map((entry) => entry.tmdb_id)
    .join(",");

  const [retryCount, setRetryCount] = useState(0);
  const [fetched, setFetched] = useState<Fetched | null>(null);
  const requestKey = `${seedKey}|${excludeKey}|${retryCount}`;

  useEffect(() => {
    if (!seedKey) return;

    const controller = new AbortController();
    fetch(`/api/recommendations?seeds=${seedKey}&exclude=${excludeKey}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`El servidor respondió con estado ${response.status}`);
        return (await response.json()) as { results: MovieSummary[] };
      })
      .then((data) => setFetched({ key: requestKey, movies: data.results }))
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setFetched({
          key: requestKey,
          error: cause instanceof Error ? cause.message : "Error desconocido",
        });
      });

    return () => controller.abort();
  }, [seedKey, excludeKey, requestKey]);

  if (state === "loading") return <MovieGridSkeleton count={12} />;
  if (state === "error") return <LibraryError message={error} onRetry={reload} />;

  if (entries.length === 0) {
    return (
      <Empty
        title="Aún no tienes películas en tu biblioteca"
        text="Agrega y puntúa algunas películas animadas y aquí aparecerán recomendaciones hechas a tu medida."
        cta="Explorar películas"
      />
    );
  }

  if (reason === "none") {
    return (
      <Empty
        title="Puntúa una película para empezar"
        text="Las recomendaciones salen de las películas que puntúas con 4 o 5 estrellas (o que marcas como favoritas). Abre una de tu biblioteca y dale tu puntuación."
        cta="Ir a mi biblioteca"
        href="/biblioteca"
      />
    );
  }

  const current = fetched?.key === requestKey ? fetched : null;

  return (
    <div>
      <p className="mb-8 max-w-3xl text-muted">
        {reason === "rating" ? "Porque te gustaron: " : "Porque marcaste como favoritas: "}
        {seeds.map((seed, index) => (
          <span key={seed.id}>
            {index > 0 && ", "}
            <Link
              href={`/pelicula/${seed.tmdb_id}`}
              className="font-bold text-ink underline underline-offset-2"
            >
              {seed.title}
            </Link>
          </span>
        ))}
        .
      </p>

      {!current && <MovieGridSkeleton count={12} />}

      {current && "error" in current && (
        <LibraryError
          title="No pudimos cargar las recomendaciones"
          message={current.error}
          onRetry={() => setRetryCount((count) => count + 1)}
        />
      )}

      {current && "movies" in current && current.movies.length === 0 && (
        <Empty
          title="Por ahora no hay recomendaciones nuevas"
          text="Ya tienes en tu biblioteca todo lo que sugiere el catálogo para tus películas favoritas. Puntúa otras para ampliar la búsqueda."
          cta="Explorar películas"
        />
      )}

      {current && "movies" in current && current.movies.length > 0 && (
        <MovieGrid movies={current.movies} priorityCount={6} />
      )}
    </div>
  );
}

function Empty({
  title,
  text,
  cta,
  href = "/explorar",
}: {
  title: string;
  text: string;
  cta: string;
  href?: string;
}) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-line px-6 py-16 text-center">
      <p className="font-display text-2xl font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-muted">{text}</p>
      <Link href={href} className="btn btn-primary mt-6">
        {cta}
      </Link>
    </div>
  );
}
