# Implementation Plan: Session Editing

**Branch**: `003-session-editing` | **Date**: 2026-02-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-session-editing/spec.md`

## Summary

Allow users to correct start and end times of completed fasting sessions via a detail modal accessed from the history list. Includes client+server validation for time ordering, overlap detection, and future-time prevention. Uses Zod for dual validation, a new `SessionDetailModal` client component, and a new `updateSession` server action.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+
**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Zod, Prisma 7
**Storage**: PostgreSQL (Neon, via Prisma)
**Testing**: Manual testing (no test framework configured yet)
**Target Platform**: Mobile-first web (375px+ viewport)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Validation feedback <500ms, save completes <2s
**Constraints**: Single user, all mutations via server actions, 44x44px touch targets
**Scale/Scope**: Single user, ~50 sessions in history

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Mobile-First, Single-Interaction UX | Edit flow ≤3 taps to correct data | PASS | Tap session → tap time → pick new time → Save = 3 taps |
| I. Mobile-First, Single-Interaction UX | 44x44px touch targets | PASS | All tappable fields use `min-h-11` |
| II. Security by Default | Server action verifies auth | PASS | `updateSession` calls `getUserId()` like all other actions |
| II. Security by Default | Queries scoped to userId | PASS | Update and overlap queries filter by `userId` |
| III. Server-First Architecture | Mutations via server actions | PASS | `updateSession` is a server action, not a REST endpoint |
| III. Server-First Architecture | Client component only where needed | PASS | Modal is interactive (date pickers, validation UX) — client component justified |
| IV. Data Integrity & Validation | Zod schemas client+server | PASS | Shared Zod schema validates time ordering, future times |
| IV. Data Integrity & Validation | Overlap prevention server-side | PASS | Server action queries for overlapping sessions before update |
| V. Premium Simplicity | Design tokens only | PASS | Modal uses existing Tailwind classes matching current UI |
| V. Premium Simplicity | `motion-safe:` for entrance animations | PASS | Modal entrance uses `motion-safe:animate-slide-up` |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/003-session-editing/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── actions/
│   │   └── fasting.ts          # Add updateSession server action
│   └── page.tsx                # Pass session list to history (already done)
├── components/
│   ├── FastingTimer.tsx         # Add onTapSession handler in history view
│   └── SessionDetailModal.tsx   # NEW: detail modal with edit form
└── lib/
    └── validators.ts            # NEW: shared Zod schemas for session validation
```

**Structure Decision**: Follows existing single-project Next.js App Router layout. New files are `SessionDetailModal.tsx` (client component) and `validators.ts` (shared validation). The existing `fasting.ts` server actions file gets a new `updateSession` action.

## Complexity Tracking

No constitution violations — this section is not applicable.
