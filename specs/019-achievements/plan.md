# Implementation Plan: Achievements & Badges

**Branch**: `019-achievements` | **Date**: 2026-03-06 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/019-achievements/spec.md`

## Summary

Add a personal milestone badge system computed from fasting session history. Badges are organized into 5 categories (Streak, Volume, Duration, Consistency, Goals) and computed on-the-fly via server actions — no database storage. A new Community tab replaces the Settings link in bottom navigation (for gamification-enabled users), with Settings moving to a gear icon in the header. Celebration overlays for newly earned badges are tracked via localStorage.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+
**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React, date-fns 4
**Storage**: Vercel Postgres (PostgreSQL) via Prisma 7 — existing `FastingSession` and `UserSettings` models (no schema changes). localStorage for celebration-seen state.
**Testing**: Manual acceptance testing (consistent with project convention)
**Target Platform**: Mobile-first web app (375px+ viewports)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Badge computation < 1 second for Community tab load (SC-001)
**Constraints**: Duration badges capped at 24h max (FR-008). Up to 5 users — on-the-fly computation is performant at this scale.
**Scale/Scope**: 5 users, ~500-1000 sessions per user max

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Mobile-First, Single-Interaction UX | All badge UI on 375px viewport, 44×44px touch targets, Community tab reachable in 1 tap | PASS | Badge grid, nav tabs, and gear icon will all meet touch target requirements |
| II. Security by Default | Server action verifies auth via `getUserId()`, all queries scoped by userId | PASS | `getBadges()` server action follows same pattern as `getStats()` — auth check + userId scoping |
| III. Server-First Architecture | Badge computation via server action, not client-side fetch | PASS | Server action computes badges; client components only for interactive celebration overlay |
| IV. Data Integrity & Validation | No new mutations — badges are read-only computed values | PASS | No new data written to DB. Celebration state is localStorage only (client-side, non-critical) |
| V. Premium Simplicity | Design tokens used, `motion-safe:` on celebration animations, no scope creep | PASS | Celebration uses existing animation patterns (bounce-in, slide-up). All colors from design system tokens |

**Pre-Phase 0 gate result**: ALL PASS — proceed to Phase 0.

### Post-Phase 1 Re-evaluation

| Principle | Gate | Status | Design Verification |
|-----------|------|--------|-------------------|
| I. Mobile-First | 375px viewport, 44×44px touch targets | PASS | Badge grid uses 3-column layout fitting 375px. Nav tabs and gear icon use `min-h-11 min-w-11`. "Got it" button on celebration is `rounded-full min-h-11`. |
| II. Security by Default | Auth check + userId scoping on all server actions | PASS | `getBadges()` calls `getUserId()` first (same as `getStats()`). Single Prisma query scoped by `userId`. No public endpoints. |
| III. Server-First | Server actions for data, client components only for interactivity | PASS | `getBadges()` is a server action called lazily from `CommunityView` client component on mount. Client components: celebration overlay (interactive dismiss), badge grid (view state switching). |
| IV. Data Integrity | No invalid state possible | PASS | No new mutations or DB writes. Badges are derived — cannot be in invalid state. localStorage is non-critical (celebration re-trigger on loss is acceptable per spec). |
| V. Premium Simplicity | Design tokens, motion-safe, no scope creep | PASS | Colors mapped to `--color-*` tokens. Celebration uses `motion-safe:animate-bounce-in`. Icons from Lucide only. No features beyond spec scope. |

**Post-design gate result**: ALL PASS — proceed to Phase 2 (task generation via `/speckit.tasks`).

## Project Structure

### Documentation (this feature)

```text
specs/019-achievements/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── actions/
│       └── badges.ts              # Server action: getBadges() computation
├── components/
│   ├── AchievementsGrid.tsx       # Badge grid display (client component)
│   ├── BadgeCelebration.tsx       # Celebration overlay (client component)
│   └── CommunityView.tsx          # Community tab content (client component)
├── lib/
│   └── badges.ts                  # Badge definitions (constants) + computation logic
└── types/
    └── badges.ts                  # Badge type definitions
```

**Structure Decision**: Follows existing project conventions — server actions in `src/app/actions/`, client components in `src/components/`, shared types in `src/types/`, pure logic in `src/lib/`. Navigation changes modify existing `FastingTimer.tsx` (bottom nav) and header area.

## Complexity Tracking

No constitution violations — section not applicable.
