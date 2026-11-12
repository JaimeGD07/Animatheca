# Animatheca

Biblioteca de películas animadas: explora el catálogo, arma tu biblioteca personal, puntúa lo que ves y recibe recomendaciones.

Proyecto de la actividad evaluada **Vibe Coding con Next.js**. El proceso de desarrollo guiado por IA está documentado en [VIBE_CODING.md](./VIBE_CODING.md).

🔗 **Despliegue:** _pendiente (se agrega al desplegar en Vercel)_

## Stack

- Next.js 16 (App Router) y TypeScript
- Tailwind CSS
- TMDB API (catálogo) mediante Route Handlers
- Supabase (biblioteca personal)
- Despliegue en Vercel

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Películas populares y mejor valoradas |
| `/explorar` | Búsqueda y filtros |
| `/pelicula/[id]` | Detalle de una película |
| `/biblioteca` | Mi biblioteca y puntuaciones |
| `/recomendaciones` | Sugerencias según mis puntuaciones |

## Instalación

Requisitos: Node.js 20+ y pnpm.

```bash
git clone <URL_DEL_REPO>
cd animatheca
pnpm install
cp .env.example .env.local   # completa las variables
pnpm dev
```

Abre http://localhost:3000.

## Variables de entorno

Ver [.env.example](./.env.example). Las claves viven en `.env.local`, que no se versiona.

## Scripts

| Comando | Acción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm lint` | Linter |

## Atribución

Este producto usa la API de TMDB pero no está avalado ni certificado por TMDB.
