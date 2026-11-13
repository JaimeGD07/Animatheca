import { NextRequest, NextResponse } from "next/server";

import { errorResponse, parseIdList } from "@/lib/api";
import { getRecommendationsFor } from "@/lib/tmdb";

/**
 * GET /api/recommendations?seeds=1,2,3&exclude=4,5
 *   seeds:   IDs de TMDB de las películas que el usuario puntuó alto
 *   exclude: IDs que ya tiene en su biblioteca (no se sugieren)
 *
 * La biblioteca vive en Supabase y la lee el navegador, así que el cliente
 * nos manda solo los IDs; este endpoint únicamente habla con TMDB.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const seedIds = parseIdList(params.get("seeds"), 5);
  const excludeIds = parseIdList(params.get("exclude"), 200);

  if (seedIds.length === 0) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await getRecommendationsFor({ seedIds, excludeIds });
    return NextResponse.json({ results });
  } catch (error) {
    return errorResponse(error);
  }
}
