/** Mensaje de error con botón para reintentar (conexión con Supabase o con la API). */
export function LibraryError({
  title = "No pudimos conectar con tu biblioteca",
  message,
  onRetry,
}: {
  title?: string;
  message?: string | null;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="mx-auto max-w-xl rounded-3xl border-2 border-dashed border-line px-6 py-14 text-center"
    >
      <p className="font-display text-2xl font-semibold">{title}</p>
      {message && <p className="mt-2 text-sm text-muted">{message}</p>}
      <button type="button" onClick={onRetry} className="btn btn-primary mt-6">
        Reintentar
      </button>
    </div>
  );
}
