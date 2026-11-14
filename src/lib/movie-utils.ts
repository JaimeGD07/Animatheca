import type { MovieVideo } from "@/types/tmdb";

/** Elige el mejor tráiler de YouTube: oficial > cualquier tráiler > cualquier video. */
export function pickTrailer(videos: MovieVideo[]): MovieVideo | undefined {
  const youtube = videos.filter((video) => video.site === "YouTube");
  return (
    youtube.find((video) => video.type === "Trailer" && video.official) ??
    youtube.find((video) => video.type === "Trailer") ??
    youtube[0]
  );
}

/** 104 → "1 h 44 min"; 45 → "45 min"; sin dato → `null`. */
export function formatRuntime(minutes: number | null | undefined): string | null {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
