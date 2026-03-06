# Implementation Plan: Gamification Settings & Opt-In

**Branch**: `018-gamification-settings` | **Date**: 2026-03-06 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/018-gamification-settings/spec.md`

## Summary

Add per-user gamification preferences to the database (master toggle + 4 feature toggles), a one-time opt-in splash screen on the timer view when the preference is undecided, and a "Community" section on the Settings page with toggles. Uses server actions for persistence, following existing patterns in `src/app/actions/settings.ts`.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+
**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Prisma 7, Zod 4, Lucide React
**Storage**: Vercel Postgres (PostgreSQL) via Prisma -- 5 new fields on existing `UserSettings` model
**Testing**: Vitest (configured in `vitest.config.ts`)
**Target Platform**: Mobile-first web (375px+), Vercel deployment
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Settings toggle response < 1s (SC-005)
**Constraints**: No new tables, no new dependencies, design tokens only
**Scale/Scope**: Up to 5 authorized users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Mobile-First, Single-Interaction UX | Splash screen and toggles must work on 375px; toggles are 44x44px touch targets | PASS |
| II. Security by Default | Server actions use `getUserId()` auth check; all queries scoped by userId | PASS |
| III. Server-First Architecture | Settings page is server component; mutations via server actions; client components only for interactive toggles and splash | PASS |
| IV. Data Integrity & Validation | Boolean fields validated by TypeScript; no complex validation needed for simple booleans | PASS |
| V. Premium Simplicity | Uses design tokens (`--color-*`), `motion-safe:animate-*` for entrance animations, follows existing toggle pattern from NotificationSettings | PASS |

## Project Structure

### Documentation (this feature)

```text
specs/018-gamification-settings/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
prisma/
└── schema.prisma                          # MODIFY: add 5 gamification fields to UserSettings
    migrations/
    └── YYYYMMDD_add_gamification_settings/ # NEW: auto-generated migration

src/
├── app/
│   ├── page.tsx                           # MODIFY: fetch gamification settings, pass to FastingTimer
│   ├── settings/
│   │   └── page.tsx                       # MODIFY: add Community section with GamificationSettings
│   └── actions/
│       └── settings.ts                    # MODIFY: add get/update gamification server actions
├── components/
│   ├── FastingTimer.tsx                   # MODIFY: accept gamificationEnabled prop, render GamificationOptIn
│   ├── GamificationSettings.tsx          # NEW: master toggle + 4 feature toggles for settings page
│   └── GamificationOptIn.tsx             # NEW: opt-in splash screen overlay
└── lib/
    └── validators.ts                      # No changes needed (simple booleans)
```

**Structure Decision**: Follows existing project layout. New components in `src/components/`, server actions in existing `src/app/actions/settings.ts`. No new directories needed.

## Constitution Re-Check (Post-Design)

All 5 principles remain satisfied after Phase 1 design:

| Principle | Post-Design Status | Notes |
|-----------|-------------------|-------|
| I. Mobile-First | PASS | Toggle pattern reused from NotificationSettings (proven 44x44px). Splash uses full-width card layout. |
| II. Security | PASS | `getGamificationSettings()` and `updateGamificationSettings()` both call `getUserId()`. All queries scoped by userId. |
| III. Server-First | PASS | Settings page remains server component. GamificationSettings and GamificationOptIn are client components (interactive). Mutations via server actions only. |
| IV. Data Integrity | PASS | Server-side Zod schema validates `updateGamificationSettings` input. Client-side Zod omitted for programmatic boolean toggle clicks (not user-typed input). Prisma schema enforces types at DB layer. |
| V. Premium Simplicity | PASS | Design tokens only. `motion-safe:animate-fade-in` for toggle reveals, `motion-safe:animate-slide-up` for splash entrance. No new dependencies. |

No constitution violations. No complexity tracking needed.
