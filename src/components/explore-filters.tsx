"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import { buildExploreHref } from "@/lib/explore-url";
import type { MovieCategory } from "@/types/tmdb";

const DEBOUNCE_MS = 400;

interface ExploreFiltersProps {
  /** Valores que hay ahora mismo en la URL. */
  q: string;
  anio?: number;
  categoria: MovieCategory;
  years: number[];
}

/**
 * Buscador de /explorar con búsqueda en vivo.
 *
 * Al escribir, espera 400 ms de pausa y actualiza la URL (`router.replace`);
 * el Server Component de la página vuelve a renderizar con los nuevos
 * resultados. El `<form action="/explorar">` se conserva como formulario GET
 * normal: si alguien lo envía antes de que la página termine de hidratarse,
 * igualmente navega a la búsqueda.
 */
export function ExploreFilters({ q, anio, categoria, years }: ExploreFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const urlYear = anio ? String(anio) : "";
  const [text, setText] = useState(q);
  const [year, setYear] = useState(urlYear);
  // Último par (texto, año) que enviamos a la URL.
  const [committed, setCommitted] = useState({ q, year: urlYear });

  // Si la URL cambia por fuera (enlace «Limpiar», botón atrás), los campos la siguen.
  // Mientras una navegación nuestra está en curso (`isPending`) no se toca nada.
  if (!isPending && (q !== committed.q || urlYear !== committed.year)) {
    setCommitted({ q, year: urlYear });
    setText(q);
    setYear(urlYear);
  }

  const commit = useCallback(
    (nextQ: string, nextYear: string) => {
      setCommitted({ q: nextQ, year: nextYear });
      startTransition(() => {
        router.replace(
          buildExploreHref({
            q: nextQ,
            categoria,
            anio: nextYear ? Number(nextYear) : undefined,
          }),
          { scroll: false },
        );
      });
    },
    [router, categoria],
  );

  // Búsqueda en vivo: se espera a que el usuario deje de escribir.
  useEffect(() => {
    const next = text.trim();
    if (next === committed.q) return;

    const timer = setTimeout(() => commit(next, year), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, year, committed.q, commit]);

  return (
    <form
      action="/explorar"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        commit(text.trim(), year); // Enter busca al instante, sin esperar
      }}
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
          value={text}
          maxLength={100}
          autoComplete="off"
          onChange={(event) => setText(event.target.value)}
          placeholder="Ej. Coco, Shrek, Moana…"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="anio" className="mb-1 block text-sm font-bold">
          Año
        </label>
        <select
          id="anio"
          name="anio"
          value={year}
          onChange={(event) => {
            setYear(event.target.value);
            commit(text.trim(), event.target.value); // el año se aplica al instante
          }}
          className="input"
        >
          <option value="">Todos</option>
          {years.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn btn-primary">
        Buscar
      </button>

      <span role="status" aria-live="polite" className="text-sm font-bold text-muted">
        {isPending ? "Buscando…" : ""}
      </span>
    </form>
  );
}
