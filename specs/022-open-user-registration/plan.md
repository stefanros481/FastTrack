# Implementation Plan: Open User Registration

**Branch**: `022-open-user-registration` | **Date**: 2026-03-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/022-open-user-registration/spec.md`

## Summary

Replace the environment-variable-based email allowlist (`AUTHORIZED_EMAILS`) with database-driven user registration. Any Google user can sign up (up to a configurable cap of 200). Users get `role` (admin/user) and `isActive` fields on the existing `User` model. The first user on a fresh deployment auto-becomes admin. Admins manage users from a new screen in settings. Per-request active-status checks ensure immediate deactivation. The `authorized-emails.ts` module and its env-var dependency are fully removed.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+
**Primary Dependencies**: Next.js 16 (App Router), React 19, Auth.js v5 (next-auth@beta), Prisma 7, Tailwind CSS v4, Zod 4, Lucide React
**Storage**: Vercel Postgres (PostgreSQL) via Prisma 7 — existing `User`, `UserSettings`, `FastingSession` models
**Testing**: Manual testing + Prisma migration verification
**Target Platform**: Web (mobile-first), deployed on Vercel
**Project Type**: Web application (server-rendered, App Router)
**Performance Goals**: Sign-up < 30s, deactivation effect immediate (next request)
**Constraints**: Max 200 users (configurable via `MAX_USERS` env var), per-request DB check for active status
**Scale/Scope**: Up to 200 registered users, ~10 files modified, 2-3 new files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Mobile-First, Single-Interaction UX | PASS | Admin user management is a settings sub-screen, follows existing mobile-first patterns. No changes to core start/stop flow. |
| II. Security by Default | REQUIRES UPDATE | Constitution says "up to 5 email addresses in AUTHORIZED_EMAILS". This feature replaces that with DB-driven auth + role system. Constitution Principle II must be amended to reflect new model. All other security requirements (middleware protection, userId scoping, per-request validation) are maintained or strengthened. |
| III. Server-First Architecture | PASS | Admin UI uses server components for data loading, server actions for mutations. No new client-side fetch patterns. |
| IV. Data Integrity & Validation | PASS | Zod validation on all admin actions (deactivate, promote). Role/active changes go through server actions with auth checks. |
| V. Premium Simplicity | PASS | Admin screen uses existing design tokens. No new design patterns needed. Scope is bounded to spec. |

**Constitution Amendment Required**: Principle II needs updating from "up to 5 emails in AUTHORIZED_EMAILS" to "database-driven role and active-status system with configurable user cap". Additionally, an admin data access carve-out is needed: "Admin-role users MAY access user management data (user list, role, active status) but MUST NOT access other users' fasting sessions, settings, or statistics." This is a MINOR version bump (2.0.0 → 2.1.0). Amendment is the FIRST task in Phase 1 (T001) — ratified before any implementation begins.

## Project Structure

### Documentation (this feature)

```text
specs/022-open-user-registration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── admin-actions.md # Server action contracts
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
prisma/
├── schema.prisma                    # MODIFY: add role, isActive to User model
└── migrations/                      # NEW: migration for role + isActive fields

src/
├── app/
│   ├── auth/
│   │   └── signin/page.tsx          # MODIFY: remove env email list, update error messages
│   ├── settings/
│   │   ├── page.tsx                 # MODIFY: add admin link for admin users
│   │   └── admin/
│   │       └── page.tsx             # NEW: admin user management page
│   └── actions/
│       └── admin.ts                 # NEW: server actions for user management
├── components/
│   └── AdminUserList.tsx            # NEW: client component for user management UI
├── lib/
│   ├── auth.ts                      # MODIFY: update signIn/jwt callbacks, remove allowlist check
│   ├── auth.config.ts               # MODIFY: update authorized callback for DB-driven check
│   └── authorized-emails.ts         # DELETE: no longer needed
├── types/
│   └── next-auth.d.ts               # MODIFY: add role, isActive to session type
└── middleware.ts                     # NO CHANGE: delegates to auth.config.ts
```

**Structure Decision**: Existing Next.js App Router structure. Admin UI lives under `/settings/admin` as a nested route within the settings area, consistent with existing navigation patterns.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitution Principle II amendment | Feature fundamentally changes auth model from env-allowlist to DB-driven | Cannot implement open registration without changing the auth model |
