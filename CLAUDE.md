# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FastTrack** is a mobile-first fasting tracker web app for a single authenticated user. Core workflow: start a fast, stop a fast, review history. Built for personal deployment on Vercel.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) — server components, API routes, server actions |
| Deployment | Vercel (automatic CI/CD from Git) |
| Authentication | Auth.js (NextAuth.js v5) — Google OAuth, JWT sessions |
| Database | Vercel Postgres (managed PostgreSQL) |
| ORM | Prisma — type-safe queries, migrations, schema management |
| Styling | Tailwind CSS — utility-first, mobile-first |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | Browser Notification API with in-app toast fallback |

## Authentication

- Google OAuth as primary provider; GitHub as optional secondary
- JWT session strategy (stateless, no session table)
- Single authorized user: `AUTHORIZED_EMAIL` env var — all other emails are rejected
- `middleware.ts` at project root protects all routes except `/auth/*` and `/api/auth/*`
- JWT session duration: 30 days with sliding window refresh

**Required env vars:** `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTHORIZED_EMAIL`, `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`

**Key auth files:** `src/lib/auth.ts`, `src/middleware.ts`, `src/app/auth/signin/page.tsx`, `src/app/api/auth/[...nextauth]/route.ts`

## Design System

Design tokens are defined in `src/index.css` `@theme` block and consumed via `var(--token-name)` or Tailwind utilities.

### Colors
- `--color-primary`: `#4f46e5` (indigo-600) — buttons, links, active states
- `--color-primary-dark`: `#4338ca` (indigo-700) — hover states
- `--color-primary-light`: `#e0e7ff` (indigo-100) — subtle backgrounds
- `--color-background`: `#F8FAFC` (slate-50) — app background
- `--color-card`: `#FFFFFF` — card surfaces
- `--color-text`: `#1E293B` (slate-800) — primary text
- `--color-text-muted`: `#64748B` (slate-500) — secondary labels
- `--color-success`: `#059669` (emerald-600)
- `--color-error`: `#dc2626` (red-600)
- `--color-warning`: `#ca8a04` (yellow-600)

### Typography (4-level hierarchy)
| Level | Tailwind Classes |
|-------|-----------------|
| Display | `text-3xl font-bold` |
| Heading | `text-xl font-semibold` |
| Body | `text-base font-normal` |
| Muted | `text-sm text-[--color-text-muted]` |

### Spacing & Touch Targets
- Card padding: `p-4` (16px)
- Minimum touch target: `min-h-11 min-w-11` (44×44px)
- Card radius: `rounded-2xl`; buttons: `rounded-full`

### Animations
- Entrance/celebration animations: always use `motion-safe:animate-*`
- Error feedback (`animate-shake`): **no** `motion-safe:` — must animate even with reduced-motion
- All keyframes use only `transform` and/or `opacity`

## Project Plans

Epics are in `plans/`. Current epics:
1. Authentication (`epic-01-authentication.md`)
2. Session Lifecycle — start/stop fasting (`epic-02-session-lifecycle.md`)
3. Session Editing (`epic-03-session-editing.md`)
4. Notes (`epic-04-notes.md`)
5. Fasting Goal (`epic-05-fasting-goal.md`)
6. Dashboard — History (`epic-06-dashboard-history.md`)
7. Dashboard — Statistics (`epic-07-dashboard-statistics.md`)
8. Dashboard — Charts (`epic-08-dashboard-charts.md`)
9. Notifications (`epic-09-notifications.md`)
10. Settings (`epic-10-settings.md`)

Reference PRD: `docs/FastTrack_PRD_v2.md`

## Development Conventions

- Do not add version fields to `docker-compose` files
- Use `npm` / `npx` for this Next.js project (not `uv` — that's for Python projects)
