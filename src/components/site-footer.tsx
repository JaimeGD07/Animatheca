export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto max-w-7xl space-y-2 px-4 py-8 text-sm text-muted">
        <p>
          Animatheca es un proyecto de práctica del bootcamp Kodigo Full Stack Jr.
        </p>
        <p>
          Este producto usa la API de{" "}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-ink underline underline-offset-2"
          >
            TMDB
          </a>{" "}
          pero no está avalado ni certificado por TMDB. Datos e imágenes de
          películas cortesía de TMDB.
        </p>
      </div>
    </footer>
  );
}
