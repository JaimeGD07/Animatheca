"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { LibraryCard } from "@/components/library-card";
import { LibraryError } from "@/components/library-error";
import { LibrarySkeleton } from "@/components/library-skeleton";
import { useLibrary } from "@/hooks/use-library";
import {
  computeStats,
  countByFilter,
  filterAndSort,
  type LibraryFilter,
  type LibrarySort,
} from "@/lib/library-utils";

const FILTERS: { value: LibraryFilter; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "por_ver", label: "Por ver" },
  { value: "vistas", label: "Vistas" },
  { value: "favoritas", label: "Favoritas" },
];

const SORTS: { value: LibrarySort; label: string }[] = [
  { value: "recientes", label: "Más recientes" },
  { value: "puntuacion", label: "Mejor puntuadas" },
  { value: "titulo", label: "Título (A-Z)" },
  { value: "anio", label: "Año de estreno" },
];

const GRID_CLASSES =
  "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6";

/** Vista de /biblioteca. Client Component: los datos viven en el Supabase del visitante. */
export function LibraryView() {
  const { entries, state, error, reload } = useLibrary();
  const [filter, setFilter] = useState<LibraryFilter>("todas");
  const [sort, setSort] = useState<LibrarySort>("recientes");
  const [query, setQuery] = useState("");

  const stats = useMemo(() => computeStats(entries), [entries]);
  const counts = useMemo(() => countByFilter(entries), [entries]);
  const visible = useMemo(
    () => filterAndSort([...entries], { filter, sort, query }),
    [entries, filter, sort, query],
  );

  if (state === "loading") return <LibrarySkeleton />;
  if (state === "error") return <LibraryError message={error} onRetry={reload} />;

  if (entries.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-line px-6 py-16 text-center">
        <p className="font-display text-2xl font-semibold">Tu biblioteca está vacía</p>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Abre cualquier película y pulsa «Agregar a mi biblioteca» para empezar a armar tu
          colección.
        </p>
        <Link href="/explorar" className="btn btn-primary mt-6">
          Explorar películas
        </Link>
      </div>
    );
  }

  return (
    <div>
      <dl className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Películas" value={String(stats.total)} />
        <Stat label="Vistas" value={String(stats.seen)} />
        <Stat label="Favoritas" value={String(stats.favorites)} />
        <Stat
          label="Tu promedio"
          value={stats.averageRating === null ? "—" : `${stats.averageRating.toFixed(1)} ★`}
        />
      </dl>

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`rounded-full border-2 border-ink px-4 py-1.5 text-sm font-extrabold transition-colors ${
                filter === value ? "bg-ink text-background" : "hover:bg-ink/10"
              }`}
            >
              {label} ({counts[value]})
            </button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="library-q" className="mb-1 block text-sm font-bold">
              Buscar
            </label>
            <input
              id="library-q"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Título…"
              className="input !w-48"
            />
          </div>
          <div>
            <label htmlFor="library-sort" className="mb-1 block text-sm font-bold">
              Ordenar por
            </label>
            <select
              id="library-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as LibrarySort)}
              className="input !w-auto"
            >
              {SORTS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-line px-6 py-14 text-center">
          <p className="font-display text-2xl font-semibold">
            Ninguna película coincide con tu selección
          </p>
          <button
            type="button"
            className="btn btn-ghost mt-5"
            onClick={() => {
              setFilter("todas");
              setQuery("");
            }}
          >
            Quitar filtros
          </button>
        </div>
      ) : (
        <>
          <h2 className="sr-only">Tus películas</h2>
          <ul className={GRID_CLASSES}>
            {visible.map((entry, index) => (
              <li key={entry.id}>
                <LibraryCard entry={entry} priority={index < 6} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-ink bg-surface px-4 py-3">
      <dt className="text-sm font-bold text-muted">{label}</dt>
      <dd className="font-display text-3xl font-bold">{value}</dd>
    </div>
  );
}
