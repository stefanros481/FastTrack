# Implementation Plan: Dashboard Charts

**Branch**: `008-dashboard-charts` | **Date**: 2026-02-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-dashboard-charts/spec.md`

## Summary

Add three Recharts-powered charts to the existing Insights dashboard view: a duration bar chart with 7/30/90-day range selector and goal line overlay, a weekly totals bar chart (last 12 weeks), and a goal hit rate donut chart. Charts are rendered client-side, fed by a new `GET /api/stats/charts` endpoint that returns pre-aggregated chart data scoped to the authenticated user. Loading skeletons and empty states are provided for each chart.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+ / Next.js 16 (App Router), React 19
**Primary Dependencies**: Recharts (new — to be installed), date-fns 4, Tailwind CSS v4, Lucide React, Zod 4
**Storage**: Vercel Postgres (PostgreSQL) via Prisma 7 — existing `FastingSession` model
**Testing**: Build verification (`bun run build`); manual acceptance testing
**Target Platform**: Mobile-first web app (375px–1440px viewports), deployed on Vercel
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Charts render within 2s of navigation; time range switch updates within 1s
**Constraints**: Mobile-first (375px minimum), no horizontal scrolling, Recharts client-side only
**Scale/Scope**: Single user, up to hundreds of sessions in 90-day window

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Mobile-First UX | Charts scale to 375px without horizontal scroll | PASS | Recharts `<ResponsiveContainer>` handles this; axis labels sized `text-sm` |
| II. Security by Default | API route verifies `auth()` session; queries scoped to `userId` | PASS | New `/api/stats/charts` follows same pattern as `/api/sessions` |
| III. Server-First Architecture | Charts are client-side (Recharts requires DOM) — data fetched via GET API route | PASS | Constitution explicitly allows client components for charts and API routes for GET semantics |
| IV. Data Integrity & Validation | Only completed sessions (endedAt != null) included; no mutations | PASS | Read-only endpoint; Zod validates query params |
| V. Premium Simplicity | Uses design tokens exclusively; `motion-safe:animate-*` for entrance | PASS | Colors from `--color-primary`, `--color-success`, `--color-warning`; no ad-hoc hex values |

**Pre-Phase 0 verdict**: All gates PASS. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/008-dashboard-charts/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── chart-data-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   └── stats/
│   │       └── charts/
│   │           └── route.ts         # GET endpoint for chart data
│   └── actions/
│       └── fasting.ts               # Existing — no changes needed
├── components/
│   ├── DurationChart.tsx            # New — bar chart with range selector
│   ├── WeeklyChart.tsx              # New — weekly totals bar chart
│   ├── GoalRateChart.tsx            # New — donut/pie chart
│   ├── ChartSkeleton.tsx            # New — loading skeletons for charts
│   ├── EmptyState.tsx               # New — reusable empty state component
│   ├── FastingTimer.tsx             # Modified — add charts to dashboard view
│   └── StatsCards.tsx               # Existing — no changes
└── lib/
    └── prisma.ts                    # Existing — no changes
```

**Structure Decision**: All new components live in `src/components/` following the flat component structure established by previous epics. The API route follows the existing `src/app/api/` convention (see `/api/sessions/route.ts`).
