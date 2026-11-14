import Link from "next/link";

export default function MovieNotFound() {
  return (
    <section className="mx-auto max-w-xl py-20 text-center">
      <p className="font-display text-7xl font-bold text-primary" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 font-display text-3xl font-bold">Película no encontrada</h1>
      <p className="mt-3 text-muted">
        No encontramos esa película en el catálogo. Puede que el enlace esté mal
        escrito o que ya no exista.
      </p>
      <Link href="/explorar" className="btn btn-primary mt-8">
        Explorar películas
      </Link>
    </section>
  );
}
