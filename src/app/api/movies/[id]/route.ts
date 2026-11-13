import { NextResponse } from "next/server";

import { badRequest, errorResponse } from "@/lib/api";
import { getMovieDetail } from "@/lib/tmdb";

/** GET /api/movies/:id — detalle de una película con tráilers y recomendaciones. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    return badRequest("El id de la película no es válido");
  }

  try {
    return NextResponse.json(await getMovieDetail(Number(id)));
  } catch (error) {
    return errorResponse(error);
  }
}
