import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl py-20 text-center">
      <p className="font-display text-7xl font-bold text-primary" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 font-display text-3xl font-bold">Esta escena no existe</h1>
      <p className="mt-3 text-muted">
        La página que buscas no está disponible o aún no ha sido construida.
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        Volver al inicio
      </Link>
    </section>
  );
}
