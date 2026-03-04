# Implementation Plan: Minimum Fasting Duration Enforcement

**Branch**: `013-min-fasting-duration` | **Date**: 2026-03-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/013-min-fasting-duration/spec.md`

## Summary

Enforce a 12-hour minimum fasting duration using the existing long-press gesture with conditional behavior: before 12 hours the ring label says "Cancel" and completing the long-press hard-deletes the session; at 12 hours or more the label says "End" and saves normally. Session edits are also validated against the 12-hour minimum via an additional Zod refinement. No database schema changes required.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+ + Next.js 16 (App Router), React 19
**Primary Dependencies**: Tailwind CSS v4, Zod 4, Lucide React, date-fns 4
**Storage**: Vercel Postgres (PostgreSQL) via Prisma 7 — existing `FastingSession` model (no schema changes)
**Testing**: Manual testing via Vercel preview deployment
**Target Platform**: Mobile-first web app (375px+ viewport)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Ring label transition must be visually immediate (within 1 second of crossing 12h mark)
**Constraints**: Existing 5-second long-press gesture must be preserved; no new UI chrome
**Scale/Scope**: Up to 5 users, personal deployment

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Mobile-First, Single-Interaction UX | Core actions ≤ 2 taps; 44×44px touch targets | PASS | No new taps added — same long-press gesture, just conditional label and outcome |
| II. Security by Default | Server actions verify auth; queries scoped by userId | PASS | `stopFast()` and `deleteSession()` both scope by userId; server-side duration check added |
| III. Server-First Architecture | Mutations via Server Actions | PASS | Uses existing `stopFast()` and `deleteSession()` server actions; no new API routes |
| IV. Data Integrity & Validation | Zod validation client+server; no overlapping sessions | PASS | New `.refine()` on `sessionEditSchema` enforces min duration both sides; `stopFast()` gets server-side guard |
| V. Premium Simplicity | Design tokens; no scope creep | PASS | No new UI elements — label text change only; uses existing `--color-*` tokens |

**Re-check after Phase 1**: All gates remain PASS. No new entities, no new UI components, no schema changes.

## Project Structure

### Documentation (this feature)

```text
specs/013-min-fasting-duration/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research
├── data-model.md        # Phase 1 — no schema changes
├── quickstart.md        # Phase 1 — developer setup
├── contracts/           # Phase 1 — server action contracts
│   └── actions.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (files to modify)

```text
src/
├── app/
│   └── actions/
│       └── fasting.ts          # Modify stopFast() — add 12h server guard
├── components/
│   ├── FastingTimer.tsx         # Modify handleLongPressComplete — conditional delete vs save
│   └── ProgressRing.tsx         # Modify label text — "Cancel" vs "End" based on new prop
└── lib/
    └── validators.ts            # Add min duration .refine() to sessionEditSchema
```

**Structure Decision**: Next.js App Router single-project structure. All changes are modifications to existing files — no new files needed.

## Complexity Tracking

> No constitution violations. No complexity tracking needed.
