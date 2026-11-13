import { cacheLife } from "next/cache";

/**
 * Año actual.
 *
 * Con Cache Components, un Server Component no puede llamar a `new Date()`
 * directamente (su valor cambia entre renders y rompe el prerenderizado).
 * Dentro de una función `use cache` sí es válido: el resultado se guarda y se
 * recalcula una vez al día.
 */
export async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("days");

  return new Date().getFullYear();
}
