# Implementation Plan: User Settings

**Branch**: `010-user-settings` | **Date**: 2026-02-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/010-user-settings/spec.md`

## Summary

Build a comprehensive settings page with user profile display (name, email, Google avatar with fallback), theme selector (dark/light/system), default fasting goal, notification preferences, and sign-out. The settings page is a server component that fetches user data and settings, rendering client components for interactive controls. No database migrations needed — all required fields already exist in `UserSettings`.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+
**Primary Dependencies**: Next.js 16 (App Router), React 19, Auth.js v5, Prisma 7, Tailwind CSS v4, Lucide React
**Storage**: Vercel Postgres (PostgreSQL) via Prisma — existing `User` and `UserSettings` models (no schema changes)
**Testing**: Manual testing via dev credentials multi-user sign-in
**Target Platform**: Mobile-first web (375px minimum viewport)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Settings page interactive within 2 seconds; theme changes < 200ms
**Constraints**: Server components for data loading; client components only where interactivity required
**Scale/Scope**: Up to 5 authorized users, 1 settings page with 5 sections

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Mobile-First, Single-Interaction UX | PASS | All controls use `min-h-11` touch targets, responsive layout, mobile-first styling per epic-10 design |
| II. Security by Default | PASS | Settings page requires auth session; all server actions scope by `userId`; middleware protects route |
| III. Server-First Architecture | PASS | Page is a server component; client components only for theme toggle, goal selector, notification controls |
| IV. Data Integrity & Validation | PASS | Goal minutes validated via existing Zod schema; notification time validated server-side |
| V. Premium Simplicity | PASS | Uses design tokens (`--color-*`), standard spacing, `motion-safe:animate-fade-in` entrance. No scope creep — all features defined in epic-10 |

## Project Structure

### Documentation (this feature)

```text
specs/010-user-settings/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── settings-page.md
│   └── settings-actions.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── settings/
│       └── page.tsx            # Server component — settings page (MODIFY)
├── components/
│   ├── ThemeProvider.tsx        # Theme context provider (EXISTS, no changes)
│   ├── DefaultGoalSetting.tsx   # Goal setting control (EXISTS, no changes)
│   ├── UserProfile.tsx          # NEW — profile avatar + name + email
│   ├── ThemeSelector.tsx        # NEW — 3-way theme selector for settings
│   ├── NotificationSettings.tsx # NEW — reminder toggle, time picker, max duration
│   └── SignOutButton.tsx        # NEW — extracted sign-out button component
└── actions/
    └── settings.ts              # Server actions (MODIFY — add notification actions)
```

**Structure Decision**: Single Next.js app with App Router. Settings page is a server component that imports client components for interactive sections. 5 modified files + 4 new client components.
