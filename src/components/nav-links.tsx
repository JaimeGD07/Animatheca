"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/explorar", label: "Explorar" },
  { href: "/biblioteca", label: "Mi biblioteca" },
  { href: "/recomendaciones", label: "Para ti" },
];

/** Navegación principal. Es Client Component solo para resaltar la ruta activa. */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Principal"
      className="-mx-1 flex max-w-full gap-1 overflow-x-auto text-sm font-bold"
    >
      {LINKS.map(({ href, label }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-full px-4 py-2 transition-colors ${
              active ? "bg-ink text-background" : "hover:bg-ink/10"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
