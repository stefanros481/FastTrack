# Implementation Plan: Dashboard Statistics

**Branch**: `007-dashboard-statistics` | **Date**: 2026-02-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-dashboard-statistics/spec.md`

## Summary

Add seven summary stat cards to the existing dashboard view in `FastingTimer.tsx`: total fasts, average duration, longest fast, current streak, best streak, this week (count + hours), and this month (count + hours). Extend the existing `getStats()` server action with streak and period calculations. Add a new `StatsCards` client component with skeleton loading states and entrance animations.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+ / Next.js 16 (App Router)
**Primary Dependencies**: React 19, Prisma 7, date-fns 4, Tailwind CSS v4, Lucide React, Zod 4
**Storage**: Vercel Postgres (PostgreSQL) via Prisma — existing `FastingSession` model
**Testing**: Manual testing (no test framework currently configured)
**Target Platform**: Mobile-first web application (375px+ viewport), deployed on Vercel
**Project Type**: Web application (Next.js App Router, server components + client components)
**Performance Goals**: Statistics displayed within 2 seconds of dashboard navigation
**Constraints**: Single authenticated user; all queries scoped to userId; stats computed on demand (no caching)
**Scale/Scope**: Single user, hundreds to low thousands of fasting sessions over time

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Mobile-First, Single-Interaction UX | Stat cards viewable on 375px without horizontal scroll; touch targets ≥ 44×44px | PASS | Grid layout with responsive columns; cards are read-only (no tap targets needed beyond visual display) |
| II. Security by Default | All data queries scoped to authenticated userId; server action verifies auth | PASS | Extends existing `getUserId()` pattern in `fasting.ts`; no new public endpoints |
| III. Server-First Architecture | Stats computed server-side via server action; client component only for rendering | PASS | `getStats()` is a server action called from server component `page.tsx`; `StatsCards` is client component for skeleton/animation only |
| IV. Data Integrity & Validation | Only completed sessions (endedAt !== null) included in calculations | PASS | Existing filter `endedAt: { not: null }` already in use; no mutations in this feature |
| V. Premium Simplicity | Design tokens used for all colors/spacing; `motion-safe:animate-fade-in` for entrance | PASS | Uses `--color-card`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-success`; no ad-hoc values |

**Result**: All gates PASS. No violations to track.

## Project Structure

### Documentation (this feature)

```text
specs/007-dashboard-statistics/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── page.tsx                    # MODIFY — pass extended stats to FastingTimer
│   └── actions/
│       └── fasting.ts              # MODIFY — extend getStats() with streak + period stats
├── components/
│   ├── FastingTimer.tsx            # MODIFY — replace inline dashboard view with StatsCards
│   ├── StatsCards.tsx              # NEW — stat card grid component
│   └── StatsCardSkeleton.tsx      # NEW — skeleton loading for stat cards
└── lib/
    └── format.ts                   # NEW — duration formatting utility (Xh Ym)
```

**Structure Decision**: Follows the existing Next.js App Router layout. New components go in `src/components/` alongside existing feature components. Stats logic stays in the existing `src/app/actions/fasting.ts` server action file. A small formatting utility is extracted to `src/lib/format.ts` to avoid duplicating duration formatting logic across components.

## Complexity Tracking

> No constitution violations. This section is intentionally empty.
