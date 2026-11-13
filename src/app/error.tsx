"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect } from "react";

/** Límite de error global: se muestra si falla la carga de datos (por ejemplo, TMDB caído). */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  function retry() {
    // refresh() vuelve a pedir los datos al servidor; reset() vuelve a pintar la ruta.
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <section role="alert" className="mx-auto max-w-xl py-20 text-center">
      <p className="font-display text-6xl" aria-hidden="true">
        :(
      </p>
      <h1 className="mt-4 font-display text-3xl font-bold">Algo salió mal</h1>
      <p className="mt-3 text-muted">
        No pudimos cargar las películas. Puede ser un problema temporal con el
        catálogo. Inténtalo de nuevo en unos segundos.
      </p>
      <button type="button" onClick={retry} className="btn btn-primary mt-8">
        Intentar de nuevo
      </button>
    </section>
  );
}
