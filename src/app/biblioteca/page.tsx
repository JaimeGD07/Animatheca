import type { Metadata } from "next";

import { LibraryView } from "@/components/library-view";

export const metadata: Metadata = { title: "Mi biblioteca" };

export default function LibraryPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold">Mi biblioteca</h1>
        <p className="mt-2 text-muted">
          Tus películas animadas guardadas, con su estado y tu puntuación.
        </p>
      </header>
      <LibraryView />
    </div>
  );
}
