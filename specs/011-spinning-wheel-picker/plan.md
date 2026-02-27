# Implementation Plan: Spinning Wheel Date/Time Picker

**Branch**: `011-spinning-wheel-picker` | **Date**: 2026-02-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/011-spinning-wheel-picker/spec.md`

## Summary

Replace all date/time selectors (session editing, notification time) with iOS-style spinning wheel pickers using `@ncdai/react-wheel-picker`. Add ability to edit active session start time. Pickers presented as bottom sheet overlays with smooth momentum scrolling, theme support, and keyboard navigation.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+ / Next.js 16 (App Router), React 19
**Primary Dependencies**: `@ncdai/react-wheel-picker` (v1.2.0, zero production deps), Tailwind CSS v4, Lucide React, date-fns 4, Zod 4
**Storage**: Vercel Postgres (PostgreSQL) via Prisma 7 — existing `FastingSession` and `UserSettings` models (no schema changes)
**Target Platform**: Mobile-first web app (375px+ viewport), desktop support
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Picker interactive within 1 second of open, selection in under 10 seconds
**Constraints**: 320px minimum viewport, 44px minimum touch targets, light/dark theme support
**Scale/Scope**: Single feature — 3 picker integrations, 1 new server action, 2 new UI components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Mobile-First, Single-Interaction UX | All pickers meet 44px touch targets, work on 375px viewport, spinning wheel reduces taps vs current popover | PASS |
| II. Security by Default | New `updateActiveStartTime` server action verifies auth via `auth()`, scopes query to `userId` | PASS |
| III. Server-First Architecture | Wheel picker components are Client Components (interactivity required). Mutations via Server Actions. | PASS |
| IV. Data Integrity & Validation | Active start time edit validated with Zod (client + server). Existing session edit validation unchanged. | PASS |
| V. Premium Simplicity | Uses design token system (`--color-*`). Bottom sheet uses existing `animate-slide-up`. No scope creep beyond spec. | PASS |

**Post-Phase 1 Re-check**: All gates still PASS. No new dependencies beyond the single wheel picker library. No schema changes.

## Project Structure

### Documentation (this feature)

```text
specs/011-spinning-wheel-picker/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── wheel-picker-components.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   └── actions/
│       └── fasting.ts              # Add updateActiveStartTime server action
├── components/
│   ├── ui/
│   │   ├── wheel-date-time-picker.tsx  # NEW: Date+time wheel picker (bottom sheet)
│   │   ├── wheel-time-picker.tsx       # NEW: Time-only wheel picker (bottom sheet)
│   │   └── date-time-picker.tsx        # EXISTING: Will be replaced in consumers
│   ├── SessionDetailModal.tsx      # MODIFY: Use WheelDateTimePicker
│   ├── FastingTimer.tsx            # MODIFY: Add tappable start time → wheel picker
│   └── NotificationSettings.tsx    # MODIFY: Use WheelTimePicker
└── lib/
    └── validators.ts               # Add activeStartTimeSchema
```

**Structure Decision**: Follows existing Next.js App Router structure. New wheel picker components go in `src/components/ui/` alongside the existing `date-time-picker.tsx`. The old `date-time-picker.tsx` can be removed once all consumers are migrated.
