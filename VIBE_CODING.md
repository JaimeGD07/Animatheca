# VIBE_CODING.md — Registro del proceso

Registro del flujo de desarrollo guiado por IA de **Animatheca**.

- **Herramienta de IA:** Claude (asistente conversacional)
- **Rol de la IA:** copiloto que propone y genera código y estructura
- **Rol del desarrollador:** definir el alcance, validar cada fase en local, corregir y decidir

> Este documento se completa al cerrar cada fase, no al final del proyecto.

---

## 1. Prompts principales

### Prompt 1 — Concepción (Fase 0)

> "Actúa como arquitecto de software. Quiero una app Next.js 16 (App Router, TypeScript, Tailwind) para gestionar una biblioteca personal de películas animadas con TMDB y Supabase. Propón rutas, modelo de datos, y qué es Server o Client Component."

**Resultado:** propuesta de 5 rutas (`/`, `/explorar`, `/pelicula/[id]`, `/biblioteca`, `/recomendaciones`), uso de Route Handlers como proxy hacia TMDB y Supabase para la biblioteca personal.

<!-- Añadir aquí los prompts de las fases siguientes -->

---

## 2. Iteraciones con la IA

| Fase | Qué se pidió | Qué generó la IA | Qué se corrigió o ajustó |
|---|---|---|---|
| 0 | Concepción y alcance | Rutas, stack y modelo general | Se descartó el tracker de gastos; el catálogo será público, sin login |
| 1 | Scaffold y archivos base | _pendiente_ | _pendiente_ |

---

## 3. Decisiones técnicas

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| Tema: biblioteca de películas animadas | Tracker de gastos | Más distintivo y combina API externa con datos propios |
| Catálogo sin login | Auth con Supabase (como en la Tarea 16) | El foco es el flujo de Vibe Coding; la app queda accesible para cualquiera |
| Clave de TMDB solo en el servidor (Route Handlers) | Llamar a TMDB desde el navegador | No exponer la clave |
| pnpm como gestor de paquetes | npm | Consistencia con proyectos anteriores |

---

## 4. Desafíos encontrados y cómo se resolvieron

| Desafío | Cómo se resolvió con apoyo de IA |
|---|---|
| _Se completa durante el desarrollo_ | |

---

## 5. Validación del código generado

Checklist que se aplica al cierre de cada fase:

- [ ] `pnpm exec tsc --noEmit` sin errores
- [ ] `pnpm lint` sin errores
- [ ] `pnpm build` exitoso
- [ ] Probado manualmente en móvil y escritorio
- [ ] Sin claves en el repositorio
- [ ] Commit descriptivo realizado
