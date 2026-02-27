# Implementation Plan: Multi-User Support

**Branch**: `009-multi-user-support` | **Date**: 2026-02-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-multi-user-support/spec.md`

## Summary

Transition FastTrack from single-user (`AUTHORIZED_EMAIL`) to multi-user (`AUTHORIZED_EMAILS`, up to 5) authentication. The database schema already supports multiple users via `userId` foreign keys — changes are confined to the auth layer: env var parsing, sign-in callback, per-request middleware validation, dev credentials provider, and sign-in page UI. No schema migrations required.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+
**Primary Dependencies**: Next.js 16 (App Router), React 19, Auth.js v5 (next-auth@beta), Prisma 7, Tailwind CSS v4
**Storage**: Vercel Postgres (PostgreSQL) via Prisma — existing `User`, `UserSettings`, `FastingSession` models (no schema changes)
**Testing**: Manual testing via dev credentials provider with multi-user dropdown
**Target Platform**: Vercel (serverless, edge middleware)
**Project Type**: Web application (mobile-first)
**Performance Goals**: Sign-in < 3s, middleware allowlist check negligible overhead (parsing ≤5 emails)
**Constraints**: Max 5 authorized users, env-var-based user management (no admin UI)
**Scale/Scope**: 5 users max, 5 files modified + 2 new files (middleware.ts, authorized-emails.ts)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Mobile-First, Single-Interaction UX | PASS | Dev sign-in dropdown only visible in development; production UX unchanged (single Google button) |
| II. Security by Default | PASS (with action) | Currently missing `middleware.ts` — this plan creates it to enforce per-request allowlist validation. All queries already scoped by `userId`. Sign-in callback updated to check allowlist. |
| III. Server-First Architecture | PASS | Allowlist parsing and validation happen server-side (auth callback + middleware). Dev user picker uses server action for sign-in. |
| IV. Data Integrity & Validation | PASS | Email parsing includes trim, lowercase, deduplication, max-5 enforcement. Existing Zod validation on mutations unchanged. |
| V. Premium Simplicity | PASS | No UI changes in production. Dev sign-in dropdown follows existing design tokens. No scope creep. |

**Gate result**: PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/009-multi-user-support/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (files to modify/create)

```text
src/
├── lib/
│   ├── auth.ts              # MODIFY — multi-email sign-in callback
│   ├── auth.config.ts       # MODIFY — dev credentials with email param
│   └── authorized-emails.ts # NEW — email list parsing utility
├── app/
│   └── auth/
│       └── signin/
│           └── page.tsx     # MODIFY — dev user picker dropdown
└── middleware.ts             # NEW — per-request allowlist validation (project root level via auth.config.ts)

.env.local.example           # MODIFY — AUTHORIZED_EMAILS documentation
```

**Structure Decision**: Existing Next.js App Router structure. New utility module `authorized-emails.ts` extracts email parsing logic for reuse across sign-in callback, middleware, and dev credentials. Middleware created at edge-compatible level using `auth.config.ts` (no Prisma import — edge runtime compatible).

## Complexity Tracking

> No constitution violations to justify.
