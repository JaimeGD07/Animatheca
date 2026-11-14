import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { LibraryPanel } from "@/components/library-panel";
import { MovieGrid } from "@/components/movie-grid";
import { tmdbImage } from "@/lib/images";
import { formatRuntime, pickTrailer } from "@/lib/movie-utils";
import { ANIMATION_GENRE_ID, getMovieDetail, TmdbError } from "@/lib/tmdb";
import type { MovieDetail } from "@/types/tmdb";

type Props = { params: Promise<{ id: string }> };

/** Busca la película; devuelve `null` si el id no es válido o TMDB responde 404. */
async function findMovie(idParam: string): Promise<MovieDetail | null> {
  if (!/^\d+$/.test(idParam) || Number(idParam) <= 0) return null;
  try {
    return await getMovieDetail(Number(idParam));
  } catch (error) {
    if (error instanceof TmdbError && error.status === 404) return null;
    throw error; // cualquier otro fallo lo atrapa app/error.tsx
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const movie = await findMovie(id);
  if (!movie) return { title: "Película no encontrada" };

  const poster = tmdbImage(movie.poster_path, "w500");
  return {
    title: movie.title,
    description: movie.overview
      ? movie.overview.slice(0, 160)
      : `Detalle de ${movie.title} en Animatheca.`,
    openGraph: poster ? { images: [poster] } : undefined,
  };
}

export default function MovieDetailPage({ params }: Props) {
  return (
    <div>
      <Link
        href="/explorar"
        className="mb-6 inline-block text-sm font-extrabold underline underline-offset-4"
      >
        ← Volver a explorar
      </Link>
      {/* `params` es un dato de la petición: se resuelve dentro de Suspense. */}
      <Suspense fallback={<DetailSkeleton />}>
        <MovieDetailContent params={params} />
      </Suspense>
    </div>
  );
}

async function MovieDetailContent({ params }: Props) {
  const { id } = await params;
  const movie = await findMovie(id);
  if (!movie) notFound();

  const year = movie.release_date?.slice(0, 4);
  const runtime = formatRuntime(movie.runtime);
  const trailer = pickTrailer(movie.videos.results);
  const backdrop = tmdbImage(movie.backdrop_path, "w780");
  const poster = tmdbImage(movie.poster_path, "w500");
  const similar = movie.recommendations.results
    .filter((item) => item.genre_ids.includes(ANIMATION_GENRE_ID))
    .slice(0, 6);

  return (
    <article>
      {/* Banner con el fondo de la película */}
      <div className="relative h-48 overflow-hidden rounded-3xl border-2 border-ink bg-primary/20 sm:h-72">
        {backdrop && (
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="object-cover"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-[16rem_1fr]">
        {/* Póster que sobresale del banner */}
        <div className="-mt-20 px-4 md:-mt-32 md:px-0">
          <div className="relative mx-auto aspect-[2/3] w-44 overflow-hidden rounded-2xl border-2 border-ink bg-surface shadow-lg md:w-full">
            {poster ? (
              <Image
                src={poster}
                alt={`Póster de ${movie.title}`}
                fill
                priority
                sizes="(min-width: 768px) 256px, 176px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center p-4 text-center text-sm font-semibold text-muted">
                Sin póster
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 md:pt-6">
          <header>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="mt-2 text-lg italic text-muted">{movie.tagline}</p>
            )}

            <ul className="mt-4 flex flex-wrap items-center gap-2 text-sm font-bold">
              {movie.vote_count > 0 && (
                <li className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-background">
                  <span aria-hidden="true" className="text-star">
                    ★
                  </span>
                  {movie.vote_average.toFixed(1)}
                  <span className="sr-only"> de 10 en TMDB</span>
                </li>
              )}
              {year && <li className="rounded-full border-2 border-ink px-3 py-0.5">{year}</li>}
              {runtime && (
                <li className="rounded-full border-2 border-ink px-3 py-0.5">{runtime}</li>
              )}
              {movie.genres.map((genre) => (
                <li
                  key={genre.id}
                  className="rounded-full bg-accent/20 px-3 py-1 text-ink"
                >
                  {genre.name}
                </li>
              ))}
            </ul>
          </header>

          <section aria-labelledby="overview-title">
            <h2 id="overview-title" className="font-display text-2xl font-bold">
              Sinopsis
            </h2>
            <p className="mt-2 max-w-prose leading-relaxed">
              {movie.overview || "Esta película aún no tiene sinopsis en español."}
            </p>
          </section>

          <LibraryPanel
            movie={{
              tmdb_id: movie.id,
              title: movie.title,
              poster_path: movie.poster_path,
              release_date: movie.release_date || null,
            }}
          />
        </div>
      </div>

      <section aria-labelledby="trailer-title" className="mt-14">
        <h2 id="trailer-title" className="font-display text-3xl font-bold">
          Tráiler
        </h2>
        {trailer ? (
          <div className="mt-4 aspect-video max-w-3xl overflow-hidden rounded-3xl border-2 border-ink bg-ink">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailer.key}`}
              title={`Tráiler de ${movie.title}`}
              loading="lazy"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="size-full"
            />
          </div>
        ) : (
          <p className="mt-3 text-muted">No hay tráiler disponible para esta película.</p>
        )}
      </section>

      {similar.length > 0 && (
        <section aria-labelledby="similar-title" className="mt-14">
          <h2 id="similar-title" className="mb-6 font-display text-3xl font-bold">
            Películas similares
          </h2>
          <MovieGrid movies={similar} />
        </section>
      )}
    </article>
  );
}

function DetailSkeleton() {
  return (
    <div role="status" aria-live="polite" className="motion-safe:animate-pulse">
      <span className="sr-only">Cargando película…</span>
      <div aria-hidden="true">
        <div className="h-48 rounded-3xl bg-ink/10 sm:h-72" />
        <div className="mt-8 grid gap-8 md:grid-cols-[16rem_1fr]">
          <div className="-mt-20 mx-auto aspect-[2/3] w-44 rounded-2xl bg-ink/15 md:-mt-32 md:w-full" />
          <div className="space-y-4 md:pt-6">
            <div className="h-10 w-3/4 rounded-full bg-ink/10" />
            <div className="h-5 w-1/2 rounded-full bg-ink/10" />
            <div className="h-24 rounded-2xl bg-ink/10" />
            <div className="h-48 rounded-3xl bg-ink/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
