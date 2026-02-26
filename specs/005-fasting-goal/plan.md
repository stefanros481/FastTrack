# Implementation Plan: Fasting Goal

**Branch**: `005-fasting-goal` | **Date**: 2026-02-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-fasting-goal/spec.md`

## Summary

Replace the existing 2x2 protocol card grid with goal pills (12h, 16h, 18h, 20h, 24h) + custom input, preserving protocol subtitles on matching pills. Add a circular SVG progress ring that replaces the background fill animation during active fasts with a goal. Implement goal-reached notifications (Browser Notification API with in-app toast fallback). Add a "Default fasting goal" setting on the settings page that pre-fills the goal selector for new sessions.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+ / Next.js 16 (App Router), React 19
**Primary Dependencies**: Tailwind CSS v4, Zod 4, Lucide React, date-fns 4
**Storage**: Vercel Postgres (PostgreSQL) via Prisma 7 — existing `FastingSession.goalMinutes` and `UserSettings.defaultGoalMinutes` fields (no schema changes needed)
**Testing**: Build verification (`bun run build`); manual acceptance testing
**Target Platform**: Mobile-first web app (375px–1440px viewports), deployed on Vercel
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Progress ring updates every 1s; goal notification fires within 2s of goal time
**Constraints**: Mobile-first (375px minimum), 44×44px touch targets, animations use only transform/opacity
**Scale/Scope**: Single user, personal deployment

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Mobile-First UX | Goal pills and custom input operable at 375px; start fast ≤ 2 taps | PASS | Pills are horizontal scroll or wrap; custom input inline; goal selection doesn't add taps to start flow |
| II. Security by Default | All server actions verify `auth()` before mutations | PASS | `startFast()` already checks auth; new `updateDefaultGoal` action will follow same pattern |
| III. Server-First Architecture | Default goal fetched server-side in page.tsx; client components only for interactive elements | PASS | Goal selector and progress ring are interactive → client component. Default goal loaded SSR and passed as prop. |
| IV. Data Integrity & Validation | Goal minutes validated with Zod (min 60, max 4320); server-side authoritative | PASS | Client + server Zod validation. Custom input validated before startFast call. |
| V. Premium Simplicity | Design tokens only; `motion-safe:animate-*` for celebrations; no ad-hoc hex | PASS | Ring uses `--color-primary`, `--color-success`; celebration uses `motion-safe:`; shake for errors omits `motion-safe:` |

**Pre-Phase 0 verdict**: All gates PASS. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/005-fasting-goal/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── page.tsx                    # Modified — pass defaultGoalMinutes to FastingTimer
│   ├── settings/
│   │   └── page.tsx                # Modified — add default goal setting UI
│   └── actions/
│       └── settings.ts             # Modified — add updateDefaultGoal, getDefaultGoal actions
├── components/
│   ├── FastingTimer.tsx            # Modified — replace protocol cards with GoalSelector, add ProgressRing, add notification logic
│   ├── GoalSelector.tsx            # New — goal pill buttons + custom input (extracted from FastingTimer)
│   ├── ProgressRing.tsx            # New — SVG circular progress ring with timer/percentage inside
│   ├── Toast.tsx                   # New — reusable in-app toast component
│   └── DefaultGoalSetting.tsx      # New — client component for default goal picker on settings page
├── hooks/
│   └── useGoalNotification.ts      # New — hook managing goal-reached detection, browser notification, toast
└── lib/
    └── validators.ts               # Modified — add goalMinutes Zod schema
```

**Structure Decision**: All new components live in `src/components/` following the flat component structure established by previous epics. The notification hook lives in `src/hooks/` alongside `useChartData.ts`.
