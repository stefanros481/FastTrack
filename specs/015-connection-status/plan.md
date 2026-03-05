# Implementation Plan: Database Connection Status Indicator

**Branch**: `015-connection-status` | **Date**: 2026-03-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/015-connection-status/spec.md`

## Summary

Add a visual connection status indicator to the app header that checks backend/database readiness on page load. Shows "Connecting..." (yellow, pulsing) while waiting, "Online" (green, auto-hides after 3s) on success, or "Offline" (red, persists with auto-retry every 5s) on failure. The "Start Fast" button is disabled until the backend is confirmed online. No other actions are blocked.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+
**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React
**Storage**: Vercel Postgres (PostgreSQL) via Prisma 7 — read-only `SELECT 1` health check
**Testing**: Manual testing (no test framework configured in project)
**Target Platform**: Mobile-first web app (375px+ viewport), deployed on Vercel
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Health check response < 2s when DB is awake; indicator visible within 1s of page load
**Constraints**: No cron jobs or keep-alive mechanisms; purely on-demand health check on app load
**Scale/Scope**: Up to 5 authorized users; single health check endpoint

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Mobile-First, Single-Interaction UX | Indicator fits 375px viewport; no extra taps needed | PASS | Small pill in header, auto-hides; no user interaction required |
| II. Security by Default | Health check endpoint protected by auth middleware | PASS | `/api/health` is not in exempt paths, so middleware protects it; auth session checked in route |
| III. Server-First Architecture | Uses API route (GET semantics) for health check; client component only where interactivity required | PASS | API route for GET health check; client component for polling + UI state |
| IV. Data Integrity & Validation | No mutations; read-only `SELECT 1` | PASS | No data changes; no validation needed |
| V. Premium Simplicity | Uses design tokens (`--color-success`, `--color-warning`, `--color-error`); `motion-safe:` for pulse animation | PASS | Follows existing animation and token patterns |

All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/015-connection-status/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── app/
│   └── api/
│       └── health/
│           └── route.ts          # NEW: Health check API endpoint
├── hooks/
│   └── useConnectionStatus.ts    # NEW: Connection status polling hook
├── components/
│   ├── ConnectionStatus.tsx      # NEW: Status indicator UI component
│   └── FastingTimer.tsx          # MODIFIED: Integrate indicator + disable Start button
└── app/
    └── globals.css               # No changes needed — uses inline CSS transition
```

**Structure Decision**: Follows existing project conventions — API route in `src/app/api/`, custom hook in `src/hooks/`, client component in `src/components/`. No new directories needed.
