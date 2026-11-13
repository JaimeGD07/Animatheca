import { NextResponse } from "next/server";

import { TmdbError } from "@/lib/tmdb";

/** Convierte un texto en entero dentro de [min, max]; devuelve `fallback` si no es válido. */
export function parseIntInRange(
  value: string | null,
  min: number,
  max: number,
  fallback: number,
): number {
  if (value === null || !/^\d+$/.test(value)) return fallback;
  const parsed = Number(value);
  return parsed >= min && parsed <= max ? parsed : fallback;
}

/** Convierte "1,2,3" en una lista de IDs positivos (sin repetidos, máximo `max`). */
export function parseIdList(value: string | null, max = 20): number[] {
  if (!value) return [];
  const ids = value
    .split(",")
    .filter((part) => /^\d+$/.test(part))
    .map(Number)
    .filter((id) => id > 0);
  return [...new Set(ids)].slice(0, max);
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/** Respuesta de error uniforme para los Route Handlers. */
export function errorResponse(error: unknown) {
  if (error instanceof TmdbError) {
    const status = error.status === 404 ? 404 : error.status === 500 ? 500 : 502;
    return NextResponse.json({ error: error.message }, { status });
  }
  console.error(error);
  return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
}
