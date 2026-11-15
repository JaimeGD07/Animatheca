import type { MovieCategory } from "@/types/tmdb";

export interface ExploreFilters {
  q: string;
  categoria: MovieCategory;
  anio?: number;
  pagina?: number;
}

/**
 * Arma la URL de /explorar con solo los filtros que no son los de por defecto.
 * La usan la página (Server Component) y los filtros en vivo (Client Component),
 * así la URL se construye igual en ambos lados.
 */
export function buildExploreHref({ q, categoria, anio, pagina }: ExploreFilters): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  else if (categoria !== "popular") params.set("categoria", categoria);
  if (anio) params.set("anio", String(anio));
  if (pagina && pagina > 1) params.set("pagina", String(pagina));
  const query = params.toString();
  return query ? `/explorar?${query}` : "/explorar";
}
