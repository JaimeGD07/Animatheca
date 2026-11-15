# Animatheca 🎬

Biblioteca de películas animadas: explora el catálogo, arma tu biblioteca personal, puntúa lo que ves y recibe recomendaciones. **Sin registro**: cualquiera puede entrar y empezar a usarla.

Proyecto de la actividad evaluada **Implementación de Aplicación Next.js mediante Vibe Coding**. El proceso de desarrollo guiado por IA está en [VIBE_CODING.md](./VIBE_CODING.md).

🔗 **Despliegue en producción:** <https://animatheca.vercel.app/>

## Funcionalidades

- Catálogo de películas animadas (TMDB, género Animación) con populares y mejor valoradas.
- Búsqueda **en vivo** (con retraso de 400 ms) y filtro por año, con paginación.
- Detalle de película: sinopsis, géneros, duración, tráiler y películas similares.
- Biblioteca personal: estado (por ver / vista), favoritas, puntuación de 1 a 5 estrellas y notas.
- Recomendaciones calculadas a partir de tus películas mejor puntuadas o favoritas.
- Tema claro y oscuro, diseño responsive y accesible (Lighthouse Accesibilidad 100).

## Stack

- **Next.js 16** (App Router, Cache Components) y **TypeScript**
- **Tailwind CSS v4**
- **TMDB API v3** mediante Route Handlers y Server Components (token solo en el servidor)
- **Supabase** (Postgres + RLS + inicio de sesión anónimo) para la biblioteca personal
- Despliegue en **Vercel**

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Películas populares y mejor valoradas |
| `/explorar` | Búsqueda en vivo, filtro por año y categorías |
| `/pelicula/[id]` | Detalle de una película y panel para agregarla a tu biblioteca |
| `/biblioteca` | Mi biblioteca: filtros, orden, estadísticas |
| `/recomendaciones` | Sugerencias según mis puntuaciones |
| `/api/movies` | Route Handler: listado/búsqueda |
| `/api/movies/[id]` | Route Handler: detalle |
| `/api/recommendations` | Route Handler: recomendaciones a partir de semillas |

Server Components: páginas, tarjetas, cuadrícula y paginación. Client Components (`useState`/`useEffect`): navegación activa, filtros de búsqueda, panel de biblioteca, vistas de biblioteca y recomendaciones. Cada ruta tiene `loading` (Suspense/skeletons) y `error.tsx`, además de `not-found`.

## Instalación

Requisitos: Node.js 20+ y [pnpm](https://pnpm.io).

```bash
git clone https://github.com/JaimeGD07/Animatheca.git
cd animatheca
pnpm install
cp .env.example .env.local   # completa las variables
pnpm dev
```

Abre http://localhost:3000.

### Base de datos (Supabase)

1. Crea un proyecto en Supabase.
2. En **Authentication → Sign In / Providers**, activa **Allow anonymous sign-ins**.
3. En el **SQL Editor**, ejecuta [`supabase/schema.sql`](./supabase/schema.sql) (tabla `library_entries` con RLS).
4. Copia la URL y la *publishable key* del proyecto en `.env.local`.

## Variables de entorno

Ver [`.env.example`](./.env.example). Las claves viven en `.env.local`, que no se versiona.

| Variable | Uso |
|---|---|
| `TMDB_ACCESS_TOKEN` | Token de lectura de TMDB (solo servidor) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key de Supabase (pública por diseño; la protege RLS) |

## Uso

1. Explora el catálogo en `/` o busca en `/explorar`.
2. Abre una película y pulsa **Agregar a mi biblioteca**.
3. Marca estado, favorita, puntúa con estrellas y escribe notas.
4. Revisa tu colección en `/biblioteca` y las sugerencias en `/recomendaciones`.

## Despliegue en Vercel

1. Importa el repositorio en Vercel (framework: Next.js).
2. Agrega las tres variables de entorno en **Settings → Environment Variables**.
3. Despliega. Cada `git push` a `main` genera un nuevo despliegue.

## Scripts

| Comando | Acción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Servidor de producción local |
| `pnpm lint` | Linter |

## Limitaciones conocidas

- La biblioteca se asocia a la **sesión anónima del navegador**: si borras los datos del sitio o abres otro navegador, verás una biblioteca vacía. Es el costo de no pedir registro.
- Supabase limita los inicios de sesión anónimos por IP.

## Atribución

Este producto usa la API de TMDB pero no está avalado ni certificado por TMDB.
