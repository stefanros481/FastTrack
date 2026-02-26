# Implementation Plan: Dashboard — History

**Branch**: `006-dashboard-history` | **Date**: 2026-02-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-dashboard-history/spec.md`

## Summary

Upgrade the existing Log tab from a flat, 50-record dump to a paginated, infinite-scrolling history list with redesigned session cards, skeleton loading states, staggered entrance animations, and session deletion with confirmation. The implementation introduces a cursor-based API route (`GET /api/sessions`) for client-side pagination, extracts the history view from the monolithic `FastingTimer` component, adds a `deleteSession` server action, and extends `SessionDetailModal` with a delete button and confirmation flow.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+
**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Prisma 7, Zod 4, date-fns 4, Lucide React, Radix UI
**Storage**: Vercel Postgres (PostgreSQL) via Prisma — `FastingSession` model
**Testing**: No test framework configured (out of scope for this feature)
**Target Platform**: Mobile-first web app (375px+ viewport), deployed on Vercel
**Project Type**: Web application (Next.js App Router, server components + client components)
**Performance Goals**: Each page of 20 sessions loads in <2s; skeleton placeholders appear within 200ms
**Constraints**: Single authenticated user; all queries scoped to `userId`; 44x44px minimum touch targets
**Scale/Scope**: Single user, hundreds to low thousands of sessions over time

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
| --------- | ---- | ------ | ----- |
| I. Mobile-First, Single-Interaction UX | All UI operable on 375px; touch targets ≥ 44x44px; delete ≤ 3 taps | PASS | Session card tappable (min-h-11); delete is tap card → tap delete → confirm (3 taps) |
| II. Security by Default | All routes protected; server actions verify auth; queries scoped to userId | PASS | API route and deleteSession action will verify `auth()` and scope to `userId` |
| III. Server-First Architecture | Server components for data loading; client components only for interactivity; API route for GET semantics | PASS | Initial page load via server component; API route for paginated GET (explicitly allowed by constitution for GET semantics); delete via server action |
| IV. Data Integrity & Validation | Zod validation on mutations; server-side enforcement | PASS | deleteSession validates sessionId ownership server-side; no new data mutations beyond delete |
| V. Premium Simplicity | Design tokens only; motion-safe for entrance animations; no scope creep | PASS | Uses `--color-*` tokens, `motion-safe:animate-slide-up` for card entrance; no features beyond spec |

**Pre-Phase 0 gate: PASS** — No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/006-dashboard-history/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API route contract)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── page.tsx                          # Modified: remove getHistory() and history prop
│   └── api/
│       └── sessions/
│           └── route.ts                  # NEW: cursor-based paginated GET endpoint
├── components/
│   ├── FastingTimer.tsx                  # Modified: extract history view, use HistoryList
│   ├── HistoryList.tsx                   # NEW: paginated history with infinite scroll
│   ├── SessionCard.tsx                   # NEW: individual session card component
│   ├── SessionCardSkeleton.tsx           # NEW: skeleton loading placeholder
│   ├── SessionDetailModal.tsx            # Modified: add delete button + confirmation
│   └── DeleteConfirmation.tsx            # NEW: delete confirmation prompt
└── app/
    └── actions/
        └── fasting.ts                    # Modified: add deleteSession action
├── lib/
│   └── validators.ts                     # Modified: add deleteSessionSchema
```

**Structure Decision**: Next.js App Router single-project structure. New components extracted from the monolithic `FastingTimer` into dedicated files following existing conventions. API route added under `src/app/api/sessions/` for cursor-based pagination (GET semantics per Constitution Principle III).

## Complexity Tracking

> No constitution violations to justify.
