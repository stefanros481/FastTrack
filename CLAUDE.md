# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FastTrack** is a mobile-first fasting tracker web app with open user registration (up to 200 users, configurable via `MAX_USERS`). Core workflow: start a fast, stop a fast, review history. Built for personal deployment on Vercel.

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
- Open registration: any Google user can sign up (up to `MAX_USERS` env var, default 200)
- Database-driven authorization: `User.role` ("admin"/"user") and `User.isActive` (boolean)
- First user on fresh deploy auto-becomes admin; auto-admin bootstrap on existing deploys too
- `middleware.ts` at project root protects all routes except `/auth/*`, `/api/auth/*`, `/_next/*`, `/favicon.ico`, `/robots.txt`
- Per-request DB active-status check in middleware `authorized` callback — deactivation takes effect immediately
- JWT carries `role` and `isActive` for fast server-component checks; DB is authoritative
- JWT session duration: 30 days with sliding window refresh
- Each user's data is fully isolated — all queries scoped by `userId`
- Admin users can manage users (view, deactivate/reactivate, promote/demote) from Settings > User Management

**Required env vars:** `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `fast_track_DATABASE_URL_UNPOOLED`

**Optional env vars:** `MAX_USERS` (default: 200)

**Deprecated env vars (no longer used):** `AUTHORIZED_EMAILS`, `AUTHORIZED_EMAIL`

**Key auth files:** `src/lib/auth.ts`, `src/lib/auth.config.ts`, `middleware.ts`, `src/app/auth/signin/page.tsx`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/actions/admin.ts`, `src/app/settings/admin/page.tsx`

## Settings Page

Settings page at `/settings` with sections: Profile, Fasting, Safety, Community, Account.

**Key files:**
- `src/app/settings/page.tsx` — server component, fetches all settings data
- `src/app/actions/settings.ts` — server actions: getUserProfile, getTheme, updateTheme, getDefaultGoal, updateDefaultGoal, getSafetySettings, updateMaxDuration
- `src/components/UserProfile.tsx` — avatar (Google image or letter fallback) + name + email
- `src/components/ThemeSelector.tsx` — 3-button segmented control (dark/system/light), uses ThemeProvider context
- `src/components/DefaultGoalSetting.tsx` — preset + custom goal selection
- `src/components/SafetySettings.tsx` — max duration alert slider (default: 12h / 720 min, range: 1–72h)
- `src/components/SignOutButton.tsx` — sign out with redirect to sign-in page

## Spinning Wheel Pickers

All date/time selection uses iOS-style spinning wheel pickers via `@ncdai/react-wheel-picker` (v1.2.0, zero production deps). Presented as bottom sheet overlays with momentum scrolling.

**Key files:**
- `src/components/ui/wheel-date-time-picker.tsx` — 3-drum picker (date/hour/minute) for session editing and active start time
- `src/app/actions/fasting.ts` — `updateActiveStartTime` server action for editing active session start time
- `src/lib/validators.ts` — `activeStartTimeSchema` Zod validation (startedAt must be in past, no overlap)

**Usage:** Active fast start time is tappable in `FastingTimer.tsx`. Session start/end times editable in `SessionDetailModal.tsx`.

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

## Active Technologies
- TypeScript 5 / Node.js 18+ + Next.js 14+ (App Router), Auth.js v5 (next-auth@beta), Prisma, Vercel Postgres (001-authentication)
- Vercel Postgres (PostgreSQL) — User and UserSettings tables (001-authentication)
- TypeScript 5 / Node.js 18+ + Next.js 16 (App Router), React 19, Tailwind CSS v4, Zod, Prisma 7 (003-session-editing)
- PostgreSQL (Neon, via Prisma) (003-session-editing)
- TypeScript 5 / Node.js 18+ / Next.js 16 (App Router), React 19 + Next.js App Router, Auth.js v5, Prisma 7, Tailwind CSS v4, Zod, Lucide Reac (004-session-notes)
- Vercel Postgres (PostgreSQL) via Prisma — `notes` field already exists on `FastingSession` model as `String?` (004-session-notes)
- TypeScript 5 / Node.js 18+ + Next.js 16 (App Router), React 19, Tailwind CSS v4, Prisma 7, Zod 4, date-fns 4, Lucide React, Radix UI (006-dashboard-history)
- Vercel Postgres (PostgreSQL) via Prisma — `FastingSession` model (006-dashboard-history)
- TypeScript 5 / Node.js 18+ / Next.js 16 (App Router) + React 19, Prisma 7, date-fns 4, Tailwind CSS v4, Lucide React, Zod 4 (007-dashboard-statistics)
- Vercel Postgres (PostgreSQL) via Prisma — existing `FastingSession` model (007-dashboard-statistics)
- TypeScript 5 / Node.js 18+ / Next.js 16 (App Router), React 19 + Recharts (new — to be installed), date-fns 4, Tailwind CSS v4, Lucide React, Zod 4 (008-dashboard-charts)
- Vercel Postgres (PostgreSQL) via Prisma 7 — existing `FastingSession` model (008-dashboard-charts)
- TypeScript 5 / Node.js 18+ / Next.js 16 (App Router), React 19 + Tailwind CSS v4, Zod 4, Lucide React, date-fns 4 (005-fasting-goal)
- Vercel Postgres (PostgreSQL) via Prisma 7 — existing `FastingSession.goalMinutes` and `UserSettings.defaultGoalMinutes` fields (no schema changes needed) (005-fasting-goal)
- TypeScript 5 / Node.js 18+ + Next.js 16 (App Router), React 19, Auth.js v5 (next-auth@beta), Prisma 7, Tailwind CSS v4 (009-multi-user-support)
- Vercel Postgres (PostgreSQL) via Prisma — existing `User`, `UserSettings`, `FastingSession` models (no schema changes) (009-multi-user-support)
- TypeScript 5 / Node.js 18+ + Next.js 16 (App Router), React 19, Auth.js v5, Prisma 7, Tailwind CSS v4, Lucide Reac (010-user-settings)
- Vercel Postgres (PostgreSQL) via Prisma — existing `User` and `UserSettings` models (no schema changes) (010-user-settings)
- TypeScript 5 / Node.js 18+ / Next.js 16 (App Router), React 19 + `@ncdai/react-wheel-picker` (v1.2.0, zero production deps), Tailwind CSS v4, Lucide React, date-fns 4, Zod 4 (011-spinning-wheel-picker)
- Vercel Postgres (PostgreSQL) via Prisma 7 — existing `FastingSession` and `UserSettings` models (no schema changes) (011-spinning-wheel-picker)
- TypeScript 5 / Node.js 18+ + Next.js 16 (App Router), React 19, Tailwind CSS v4, ShadCN (Calendar, Popover, Button, ScrollArea), date-fns 4, lucide-reac (001-shadcn-datetime-picker)
- N/A — no database changes (001-shadcn-datetime-picker)
- TypeScript 5 / Node.js 18+ + Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Reac (012-long-press-end-session)
- TypeScript 5 / Node.js 18+ + Next.js 16 (App Router), React 19 + Tailwind CSS v4, Zod 4, Lucide React, date-fns 4 (013-min-fasting-duration)
- Vercel Postgres (PostgreSQL) via Prisma 7 — existing `FastingSession` model (no schema changes) (013-min-fasting-duration)
- TypeScript 5 / Node.js 18+ (backup script), GNU Make (orchestration) + Prisma 7 (existing ORM), `bun` (script runner) (014-db-backup)
- Vercel Postgres (PostgreSQL) — read-only access for backup (014-db-backup)
- Vercel Postgres (PostgreSQL) via Prisma 7 — read-only `SELECT 1` health check (015-connection-status)
- TypeScript 5 / Node.js 18+ + Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React, date-fns 4 (016-history-month-groups)
- N/A — no database changes; purely client-side grouping of already-fetched session data (016-history-month-groups)
- TypeScript 5 / Node.js 18+ + Next.js 16 (App Router), React 19, Tailwind CSS v4, Prisma 7, Zod 4, Lucide Reac (018-gamification-settings)
- Vercel Postgres (PostgreSQL) via Prisma -- 5 new fields on existing `UserSettings` model (018-gamification-settings)
- Vercel Postgres (PostgreSQL) via Prisma 7 — existing `FastingSession` and `UserSettings` models (no schema changes). localStorage for celebration-seen state. (019-achievements)
- TypeScript 5 / Node.js 18+ + Next.js 16 (App Router), React 19, Auth.js v5 (next-auth@beta), Prisma 7, Tailwind CSS v4, Lucide Reac (020-backend-readiness)
- Vercel Postgres (PostgreSQL) via Prisma 7 -- existing `User`, `UserSettings`, `FastingSession` models (no schema changes) (020-backend-readiness)
- TypeScript 5 / Node.js 18+ + Next.js 16 (App Router), React 19, Auth.js v5 (next-auth@beta), Prisma 7, Tailwind CSS v4, Zod 4, Lucide Reac (022-open-user-registration)
- Vercel Postgres (PostgreSQL) via Prisma 7 — existing `User`, `UserSettings`, `FastingSession` models (022-open-user-registration)
- TypeScript 5 / Node.js 18+ + Next.js 16 (App Router), React 19, Prisma 7, Tailwind CSS v4, Zod 4 (022-remove-reminders)
- Vercel Postgres (PostgreSQL) via Prisma — removing `reminderEnabled` and `reminderTime` from `UserSettings` model (022-remove-reminders)

## Recent Changes
- 001-authentication: Added TypeScript 5 / Node.js 18+ + Next.js 14+ (App Router), Auth.js v5 (next-auth@beta), Prisma, Vercel Postgres
