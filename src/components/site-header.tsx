import Link from "next/link";
import { Suspense } from "react";

import { NavLinks } from "@/components/nav-links";

function LogoMark() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 34 34"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect
        x="2"
        y="2"
        width="30"
        height="30"
        rx="10"
        className="fill-primary stroke-ink"
        strokeWidth="2.5"
      />
      <path d="M14 11.5v11l9-5.5-9-5.5Z" className="fill-ink" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight"
        >
          <LogoMark />
          Animatheca
        </Link>
        {/* usePathname() de NavLinks se resuelve en el cliente: va dentro de Suspense */}
        <Suspense fallback={<div className="h-9" aria-hidden="true" />}>
          <NavLinks />
        </Suspense>
      </div>
    </header>
  );
}
