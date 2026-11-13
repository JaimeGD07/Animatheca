import Link from "next/link";
import { Suspense } from "react";

import { MovieGrid, MovieGridSkeleton } from "@/components/movie-grid";
import { getPopular, getTopRated } from "@/lib/tmdb";

const HOME_MOVIES = 12;

export default function HomePage() {
  return (
    <div className="space-y-16">
      <Hero />

      <Section
        title="Populares ahora"
        href="/explorar?categoria=popular"
        linkLabel="Ver todas las populares"
      >
        <Suspense fallback={<MovieGridSkeleton count={HOME_MOVIES} />}>
          <PopularMovies />
        </Suspense>
      </Section>

      <Section
        title="Mejor valoradas"
        href="/explorar?categoria=top_rated"
        linkLabel="Ver todas las mejor valoradas"
      >
        <Suspense fallback={<MovieGridSkeleton count={HOME_MOVIES} />}>
          <TopRatedMovies />
        </Suspense>
      </Section>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] border-2 border-ink bg-surface px-6 py-12 sm:px-12 sm:py-16">
      {/* Formas decorativas */}
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 -z-10 size-64 rounded-full bg-primary/30 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-20 left-1/3 -z-10 size-72 rounded-full bg-accent/25 blur-3xl"
      />

      <p className="text-sm font-extrabold uppercase tracking-widest text-accent">
        Cine de animación
      </p>
      <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight sm:text-6xl">
        Tu biblioteca de películas animadas
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Explora el catálogo, guarda lo que quieres ver, puntúa tus favoritas y
        descubre qué ver después.
      </p>

      <form
        action="/explorar"
        role="search"
        className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
      >
        <label htmlFor="hero-q" className="sr-only">
          Buscar película por título
        </label>
        <input
          id="hero-q"
          name="q"
          type="search"
          placeholder="Busca una película, por ejemplo Coco"
          className="input"
        />
        <button type="submit" className="btn btn-primary shrink-0">
          Buscar
        </button>
      </form>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/explorar" className="btn btn-ghost">
          Explorar el catálogo
        </Link>
        <Link href="/biblioteca" className="btn btn-ghost">
          Ver mi biblioteca
        </Link>
      </div>
    </section>
  );
}

function Section({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-display text-3xl font-bold">{title}</h2>
        <Link href={href} className="text-sm font-extrabold underline underline-offset-4">
          {linkLabel} →
        </Link>
      </div>
      {children}
    </section>
  );
}

async function PopularMovies() {
  const data = await getPopular();
  return <MovieGrid movies={data.results.slice(0, HOME_MOVIES)} priorityCount={6} />;
}

async function TopRatedMovies() {
  const data = await getTopRated();
  return <MovieGrid movies={data.results.slice(0, HOME_MOVIES)} />;
}
