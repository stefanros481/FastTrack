# Implementation Plan: Backend Readiness Check

**Branch**: `020-backend-readiness` | **Date**: 2026-03-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/020-backend-readiness/spec.md`

## Summary

Enhance the existing 015-connection-status health check to perform deep backend readiness validation (application-table query + auth subsystem check), add granular status reporting with contextual messages ("warming up" vs "unavailable"), enforce a 10-second timeout on health checks, and extend write-action blocking from just "Start Fast" to all mutation buttons across the app (settings, session editing, notes) with disabled state + tap-to-show tooltip feedback.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+
**Primary Dependencies**: Next.js 16 (App Router), React 19, Auth.js v5 (next-auth@beta), Prisma 7, Tailwind CSS v4, Lucide React
**Storage**: Vercel Postgres (PostgreSQL) via Prisma 7 -- existing `User`, `UserSettings`, `FastingSession` models (no schema changes)
**Testing**: Manual testing (no test framework currently configured)
**Target Platform**: Mobile-first web app (375px+ viewport), deployed on Vercel
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Health check completes within 10-second timeout budget; status visible within 1 second of app load
**Constraints**: Health check must remain lightweight; Neon free-tier cold start 5-10s; max 5 users
**Scale/Scope**: Up to 5 authorized users, ~6 components need write-action blocking

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Mobile-First, Single-Interaction UX | Tooltip on disabled buttons must meet 44x44px touch target. No additional taps added to core start/stop flow when online. | PASS |
| II. Security by Default | Health check endpoint must verify auth session before executing. No data exposed in health response beyond status booleans. | PASS |
| III. Server-First Architecture | Health check is an API route (server-side). Connection status hook is client-side only where interactivity is required (polling, UI state). No new server actions introduced. | PASS |
| IV. Data Integrity & Validation | No mutations introduced. Health check performs read-only queries. Existing Zod validation on write actions unchanged. | PASS |
| V. Premium Simplicity | Uses existing design tokens (`--color-warning`, `--color-success`, `--color-error`). Pulsing animation uses `motion-safe:` prefix. No new hex values or custom spacing. | PASS |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/020-backend-readiness/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── health-api.md    # Enhanced health check endpoint contract
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── api/
│       └── health/
│           └── route.ts              # MODIFY: deep health check (app table + auth)
├── hooks/
│   └── useConnectionStatus.ts        # MODIFY: timeout, retry count, granular states
├── components/
│   ├── ConnectionStatus.tsx           # MODIFY: contextual messages (warming up / unavailable)
│   ├── ConnectionGuard.tsx            # NEW: wrapper to disable children + tooltip
│   ├── FastingTimer.tsx               # MODIFY: use ConnectionGuard for Start Fast
│   ├── DefaultGoalSetting.tsx         # MODIFY: wrap save buttons with ConnectionGuard
│   ├── NotificationSettings.tsx       # MODIFY: wrap save controls with ConnectionGuard
│   ├── GamificationSettings.tsx       # MODIFY: wrap toggle controls with ConnectionGuard
│   ├── SessionDetailModal.tsx         # MODIFY: wrap Save/Delete with ConnectionGuard
│   └── NoteInput.tsx                  # MODIFY: block auto-save when not online
└── contexts/
    └── ConnectionContext.tsx           # NEW: React context to share status app-wide
```

**Structure Decision**: Next.js App Router single-project structure. New `ConnectionContext` provides connection status to all components without prop drilling. New `ConnectionGuard` component encapsulates the disabled-button + tooltip pattern for reuse across 6+ components.
