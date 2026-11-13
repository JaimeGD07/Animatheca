import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { MovieGrid, MovieGridSkeleton } from "@/components/movie-grid";
import { Pagination } from "@/components/pagination";
import { parseIntInRange } from "@/lib/api";
import { getCurrentYear } from "@/lib/dates";
import { getPopular, getTopRated, searchAnimated } from "@/lib/tmdb";
import type { MovieCategory } from "@/types/tmdb";

export const metadata: Metadata = { title: "Explorar" };

type SearchParams = Record<string, string | string[] | undefined>;

const CATEGORIES: { value: MovieCategory; label: string }[] = [
  { value: "popular", label: "Populares" },
  { value: "top_rated", label: "Mejor valoradas" },
];

const MAX_PAGES = 500; // límite de TMDB

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

interface Filters {
  q: string;
  categoria: MovieCategory;
  anio?: number;
  pagina?: number;
}

/** Arma la URL de /explorar con solo los filtros que no son los de por defecto. */
function buildHref({ q, categoria, anio, pagina }: Filters): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  else if (categoria !== "popular") params.set("categoria", categoria);
  if (anio) params.set("anio", String(anio));
  if (pagina && pagina > 1) params.set("pagina", String(pagina));
  const query = params.toString();
  return query ? `/explorar?${query}` : "/explorar";
}

export default function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold">Explorar</h1>
        <p className="mt-2 text-muted">
          Busca por título o recorre el catálogo de películas animadas.
        </p>
      </header>

      {/* Los filtros viven en la URL (searchParams), así que esta parte es dinámica. */}
      <Suspense fallback={<MovieGridSkeleton count={20} />}>
        <ExploreContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ExploreContent({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const currentYear = await getCurrentYear();
  const q =first(params.q)?.trim().slice(0, 100) ?? "";
  const categoria: MovieCategory =
    first(params.categoria) === "top_rated" ? "top_rated" : "popular";
  const anio =
    parseIntInRange(first(params.anio) ?? null, 1900, currentYear + 1, 0) || undefined;
  const pagina = parseIntInRange(first(params.pagina) ?? null, 1, MAX_PAGES, 1);

  const data = q
    ? await searchAnimated(q, pagina, anio)
    : categoria === "top_rated"
      ? await getTopRated(pagina, anio)
      : await getPopular(pagina, anio);

  const totalPages = Math.min(data.total_pages, MAX_PAGES);
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
  const hrefFor = (target: number) =>
    buildHref({ q, categoria, anio, pagina: target });

  return (
    <>
      <form
        action="/explorar"
        role="search"
        className="mb-6 flex flex-wrap items-end gap-3"
      >
        {categoria !== "popular" && (
          <input type="hidden" name="categoria" value={categoria} />
        )}
        <div className="min-w-56 flex-1">
          <label htmlFor="q" className="mb-1 block text-sm font-bold">
            Título
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Ej. Coco, Shrek, Moana…"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="anio" className="mb-1 block text-sm font-bold">
            Año
          </label>
          <select id="anio" name="anio" defaultValue={anio ? String(anio) : ""} className="input">
            <option value="">Todos</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Buscar
        </button>
      </form>

      {q ? (
        <p className="mb-6 text-muted">
          Resultados para <strong className="text-ink">«{q}»</strong> ·{" "}
          <Link
            href={buildHref({ q: "", categoria, anio })}
            className="font-bold text-ink underline underline-offset-2"
          >
            Limpiar búsqueda
          </Link>
        </p>
      ) : (
        <nav aria-label="Categorías" className="mb-6 flex flex-wrap items-center gap-2">
          {CATEGORIES.map(({ value, label }) => (
            <Link
              key={value}
              href={buildHref({ q: "", categoria: value, anio })}
              aria-current={categoria === value ? "page" : undefined}
              className={`rounded-full border-2 border-ink px-4 py-1.5 text-sm font-extrabold transition-colors ${
                categoria === value ? "bg-ink text-background" : "hover:bg-ink/10"
              }`}
            >
              {label}
            </Link>
          ))}
          <span className="ml-2 text-sm text-muted">
            {data.total_results.toLocaleString("es-MX")} películas
          </span>
        </nav>
      )}

      {data.results.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-line px-6 py-16 text-center">
          <p className="font-display text-2xl font-semibold">
            No encontramos películas animadas con esos filtros
          </p>
          <p className="mt-2 text-muted">Prueba con otro título o quita el año.</p>
          <Link href="/explorar" className="btn btn-primary mt-6">
            Limpiar filtros
          </Link>
        </div>
      ) : (
        <>
          <MovieGrid movies={data.results} priorityCount={6} />
          <Pagination page={pagina} totalPages={totalPages} hrefFor={hrefFor} />
        </>
      )}
    </>
  );
}
