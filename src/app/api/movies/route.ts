import { NextRequest, NextResponse } from "next/server";

import { badRequest, errorResponse, parseIntInRange } from "@/lib/api";
import { getPopular, getTopRated, searchAnimated } from "@/lib/tmdb";

/**
 * GET /api/movies
 *   ?category=popular|top_rated   (por defecto popular)
 *   &query=texto                  (si viene, busca y la categoría se ignora)
 *   &year=2019                    (opcional)
 *   &page=1                       (1 a 500)
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const page = parseIntInRange(params.get("page"), 1, 500, 1);
  const maxYear = new Date().getFullYear() + 1;
  const yearParam = params.get("year");
  const year = yearParam ? parseIntInRange(yearParam, 1900, maxYear, 0) : undefined;
  if (yearParam && !year) return badRequest("El año no es válido");

  const query = params.get("query")?.trim().slice(0, 100);
  const category = params.get("category") ?? "popular";

  try {
    if (query) {
      return NextResponse.json(await searchAnimated(query, page, year));
    }
    if (category === "popular") {
      return NextResponse.json(await getPopular(page, year));
    }
    if (category === "top_rated") {
      return NextResponse.json(await getTopRated(page, year));
    }
    return badRequest("La categoría debe ser popular o top_rated");
  } catch (error) {
    return errorResponse(error);
  }
}
