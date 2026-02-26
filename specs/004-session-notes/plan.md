# Implementation Plan: Session Notes

**Branch**: `004-session-notes` | **Date**: 2026-02-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-session-notes/spec.md`

## Summary

Add optional free-text notes (max 280 characters) to fasting sessions. Users can add notes on the active fast screen, edit/clear notes on completed sessions via the session detail modal, and see one-line note previews in the history list. Notes auto-save on blur with a "Saved" indicator.

The `notes` field already exists in the Prisma schema as `String?`. Implementation requires adding a `@db.VarChar(280)` constraint via migration, creating a dedicated `updateNote` server action, adding a `NoteInput` client component with character counter, and integrating it into both the active fast view and the session detail modal.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+ / Next.js 16 (App Router), React 19
**Primary Dependencies**: Next.js App Router, Auth.js v5, Prisma 7, Tailwind CSS v4, Zod, Lucide React
**Storage**: Vercel Postgres (PostgreSQL) via Prisma — `notes` field already exists on `FastingSession` model as `String?`
**Testing**: Manual testing (no test framework currently configured)
**Target Platform**: Mobile-first web app (375px+ viewport), deployed on Vercel
**Project Type**: Web application (Next.js full-stack)
**Performance Goals**: Note save on blur < 500ms perceived latency; character counter updates on every keystroke without jank
**Constraints**: Single authorized user; all mutations via server actions; 280-character note limit enforced at UI and DB levels
**Scale/Scope**: Single user, ~50 sessions in history view; trivial data volume

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Mobile-First, Single-Interaction UX | Note input reachable on 375px viewport; touch targets ≥ 44×44px; note add/edit ≤ 2 taps from context | PASS | Textarea inline on active fast screen (0 taps); tap-to-edit on session detail (1 tap) |
| II. Security by Default | Server action verifies auth session; DB queries scoped to userId | PASS | `updateNote` action will call `auth()` and scope query to userId, matching existing `updateSession` pattern |
| III. Server-First Architecture | Mutations via server actions; client components only for interactivity | PASS | `NoteInput` is a client component (textarea + character counter need interactivity); save via server action |
| IV. Data Integrity & Validation | Zod validation client + server; 280 char limit at UI + DB (`@db.VarChar(280)`) | PASS | Will add `noteSchema` Zod validator; migration to add `@db.VarChar(280)` constraint |
| V. Premium Simplicity | Design tokens only; `motion-safe:` for animations; no scope creep | PASS | Uses `--color-text-muted`, `--color-error` tokens; no new animations needed; no features beyond spec |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/004-session-notes/
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
│   ├── actions/
│   │   └── fasting.ts              # Add updateNote server action
│   └── page.tsx                    # Pass notes field through to FastingTimer
├── components/
│   ├── FastingTimer.tsx            # Add note preview to session cards; pass notes to modal
│   ├── NoteInput.tsx               # NEW: Reusable note textarea with character counter
│   └── SessionDetailModal.tsx      # Add NoteInput for editing notes on completed sessions
└── lib/
    └── validators.ts               # Add noteSchema Zod validator

prisma/
└── schema.prisma                   # Add @db.VarChar(280) to notes field
```

**Structure Decision**: Follows existing single-app structure. One new component (`NoteInput.tsx`) is introduced as a reusable client component shared between the active fast view (in `FastingTimer.tsx`) and the session detail modal.
