# VIBE_CODING.md — Registro del proceso

Registro del flujo de desarrollo guiado por IA de **Animatheca**.

- **Herramienta de IA:** Claude (asistente conversacional con ejecución de código)
- **Rol de la IA:** copiloto que propone, genera y prueba código por fases
- **Rol del desarrollador:** definir el alcance, validar cada fase en local, crear las cuentas/claves, hacer commits y decidir

Método: el proyecto se trabajó **una fase a la vez**. La IA entrega la fase, yo la copio al proyecto, la valido (tsc, lint, build, prueba manual) y solo entonces hago commit y pido la siguiente.

---

## 1. Prompts principales

### Prompt 1 — Concepción (Fase 0)
> "Debemos realizar esta tarea: 1. evalúa el contenido, 2. diseña el plan de trabajo, 3. entiende el contexto de desarrollo, 4. elabora los elementos de entrega." (con los lineamientos en PDF)

Luego propuse el tema: *"biblioteca para películas animadas, con gestión y recomendaciones"*, y decidí: sin login, catálogo público, cuenta de TMDB creada por mí.
**Resultado:** 5 rutas, Route Handlers como proxy hacia TMDB, Supabase para la biblioteca personal.

### Prompt 2 — Scaffold y entorno (Fases 1)
> Pedí los pasos para crear el proyecto (Next.js 16, TypeScript, Tailwind, pnpm), `.env.example`, `.gitignore` seguro y una prueba de que TMDB y Supabase respondían con mis claves.

**Resultado:** proyecto base, variables de entorno y verificación con `curl` (TMDB 200, Supabase 200).

### Prompt 3 — Capa de datos (Fase 2)
> "Siguiente fase": cliente de TMDB solo para servidor, Route Handlers, tipos, esquema SQL de `library_entries` con RLS y funciones de biblioteca.

**Resultado:** `src/lib/tmdb.ts`, `src/app/api/*`, `supabase/schema.sql`, `src/lib/library.ts`.

### Prompt 4 — Layout, inicio y explorar (Fase 3)
> Sistema visual (paleta, tipografías, modo oscuro), layout, home y `/explorar` con loading y error UI.

### Prompt 5 — Detalle y biblioteca (Fases 4 y 5)
> Detalle de película con tráiler y panel de biblioteca (Client Component), `/biblioteca` con filtros y estadísticas, `/recomendaciones` basada en puntuaciones.

### Prompt 6 — Pulido (Fase 6)
> Búsqueda en vivo en `/explorar` y revisión de accesibilidad/rendimiento con Lighthouse.

### Prompt 7 — Cierre (Fase 7)
> Documentación final y validación contra los lineamientos de la tarea.

> _Nota: los prompts 2–7 están resumidos; los textos literales que escribí están en el historial de la conversación con Claude._

---

## 2. Iteraciones con la IA

| Fase | Qué se pidió | Qué generó la IA | Qué se corrigió o ajustó |
|---|---|---|---|
| 0 | Concepción y alcance | Evaluación de la tarea, plan por fases, propuestas de tema | Descarté el tracker de gastos; elegí biblioteca de animadas sin login |
| 1 | Scaffold y entorno | Pasos de instalación, `.env.example`, `.gitignore`, verificación de claves | TMDB pedía una URL en el formulario del token; se resolvió con una URL de proyecto. `next.config.ts` ajustado (imágenes TMDB) |
| 2 | Capa de datos | Cliente TMDB, Route Handlers, esquema SQL + RLS, funciones de biblioteca | Probé los endpoints y la tabla `library_entries` en Supabase |
| 3 | Layout, inicio, explorar | Diseño, componentes, `loading`/`error`/`not-found` | `new Date()` en un Server Component rompía con Cache Components → helper cacheado `lib/dates.ts` |
| 4 | Detalle y panel de biblioteca | Página de detalle, tráiler, `LibraryPanel` | 404 de TMDB llegaba como error 500 en producción (ver desafío 1) |
| 5 | Biblioteca y recomendaciones | `useLibrary`, filtros, estadísticas, recomendaciones | Cargas con `AbortController`; estados de carga derivados |
| 6 | Búsqueda en vivo y a11y | Filtros con debounce, mejoras de contraste y encabezados | Lighthouse de accesibilidad subió a 100 en las 6 páginas |
| 7 | Documentación y validación | README, este documento, auditoría contra la rúbrica | — |

---

## 3. Decisiones técnicas

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| Biblioteca de películas animadas | Tracker de gastos | Más distintivo; combina API externa y datos propios |
| Sin login: Supabase con **sesión anónima** + RLS | Auth completa (como en la Tarea 16); id local en `localStorage` | Cualquiera entra, pero los datos siguen protegidos por usuario con RLS |
| Token de TMDB solo en servidor (`server-only`) | Llamar a TMDB desde el navegador | No exponer la clave |
| `"use cache"` + `cacheLife` para TMDB | `fetch` sin caché | Menos llamadas a TMDB y páginas más rápidas |
| Server Components por defecto; Client solo donde hay estado | Todo en cliente | Menos JavaScript en el navegador |
| Búsqueda en vivo con `router.replace` + `useTransition` | Estado local sin URL | La URL es compartible y funciona con atrás/adelante |
| Tailwind v4 con tokens CSS y modo oscuro | CSS Modules | Rapidez y consistencia visual |
| Recomendaciones: puntaje 1 + vote_average/10 por aparición, hasta 5 semillas | Servicio externo de ML | Simple, explicable y sin costo |
| pnpm | npm | Consistencia con proyectos anteriores |

---

## 4. Desafíos encontrados y cómo se resolvieron

| Desafío | Cómo se resolvió con apoyo de IA |
|---|---|
| **Errores dentro de `"use cache"` pierden su tipo en producción** (un 404 de TMDB se veía como error genérico 500) | Tras un primer intento fallido (detectar el error por sus propiedades), la IA rediseñó la función cacheada para **devolver** `{ok, status}` y lanzar el `TmdbError` fuera de la caché |
| `new Date()` en un Server Component con Cache Components | Helper `getCurrentYear` cacheado en `lib/dates.ts` |
| Estado del buscador en vivo (no pisar el texto al escribir con pausas, "Limpiar" debe vaciar el campo) | Sincronización del estado desde la URL durante el render, solo cuando no hay navegación pendiente; pruebas e2e con Playwright |
| Sesión anónima creada varias veces a la vez | Promesa compartida en `ensureAnonymousSession` |
| Accesibilidad: contraste del color de acento, orden de encabezados, paginación deshabilitada | Token `--accent-text`, encabezados `sr-only`, espaciadores ocultos; Lighthouse 100 |
| TMDB pedía una URL para generar el token | Se usó la URL del repositorio/proyecto |
| `README(1).md` duplicado en el repo | `git rm "README(1).md"` y commit de limpieza |

---

## 5. Validación del código generado

Checklist aplicado al cierre de cada fase:

- [x] `pnpm exec tsc --noEmit` sin errores
- [x] `pnpm lint` sin errores
- [x] `pnpm build` exitoso
- [x] Probado manualmente en móvil y escritorio
- [x] Sin claves en el repositorio (`.env.local` ignorado)
- [x] Commit descriptivo realizado

Además, la IA ejecutó pruebas e2e con Playwright sobre un proyecto de prueba con TMDB y Supabase simulados (fase 4: 24/24, fase 5: 30/30, fase 6: 16/16) y Lighthouse: Accesibilidad 100 en las 6 páginas, SEO 100 (91 en el detalle por el meta description en streaming). El rendimiento se mide sobre la URL de Vercel.
