import type { Metadata } from "next";

import { RecommendationsView } from "@/components/recommendations-view";

export const metadata: Metadata = { title: "Para ti" };

export default function RecommendationsPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold">Para ti</h1>
        <p className="mt-2 text-muted">
          Películas animadas que podrían gustarte, según lo que has puntuado.
        </p>
      </header>
      <RecommendationsView />
    </div>
  );
}
