# Research: Open User Registration

**Feature**: 022-open-user-registration
**Date**: 2026-03-11

## Decision 1: Per-Request Active Status Check Strategy

**Decision**: Hybrid approach — store `role` and `isActive` in the JWT token at sign-in, AND perform a lightweight DB query in the `authorized` callback for immediate deactivation enforcement.

**Rationale**:
- The spec requires deactivation to take effect on the very next request (FR-006).
- JWT tokens are only refreshed at sign-in or token rotation, so JWT-only checks would delay deactivation by up to 30 days.
- Next.js 16 runs middleware on the Node.js runtime (not Edge), so Prisma queries ARE possible in the `authorized` callback.
- For an app capped at 200 users, a single `SELECT isActive FROM User WHERE email = ?` on each request is negligible overhead.
- The JWT still carries `role` for fast admin-check in server components without additional DB hits.

**Alternatives considered**:
- **JWT-only**: Fast but deactivation delayed until token refresh. Rejected per FR-006.
- **Short JWT TTL (1 hour)**: Compromise, but user gets logged out frequently and deactivation still delayed up to 1 hour. Rejected.
- **DB check on every request**: Selected. Lightweight for 200-user scale. Single indexed column lookup.

## Decision 2: Auth Callback Architecture

**Decision**: Keep the split-config pattern (`auth.config.ts` for middleware, `auth.ts` for full server-side). Move the DB active-status check into `auth.config.ts` since Next.js 16 middleware supports Node.js runtime.

**Rationale**:
- Current codebase already uses split config correctly.
- `auth.config.ts` `authorized` callback is the single enforcement point for every protected route.
- Importing Prisma in `auth.config.ts` is safe on Next.js 16 (no Edge runtime restriction).
- Keeps authorization logic centralized rather than scattered across layouts/pages.

**Alternatives considered**:
- **Layout-level check in root layout**: Would need `auth()` call + DB lookup in layout. More scattered, harder to guarantee coverage. Rejected.
- **Middleware-only (no callback change)**: Would require a custom middleware wrapper. Over-engineered. Rejected.

## Decision 3: First-User Admin Bootstrapping

**Decision**: Check user count in the `signIn` callback. If zero users exist, the new user gets `role: "admin"`. Otherwise, `role: "user"`.

**Rationale**:
- Simple atomic check: `SELECT COUNT(*) FROM User` in the signIn callback before upsert.
- No migration script needed — works on both fresh deploys and existing deployments.
- For existing deployments: the first email in `AUTHORIZED_EMAILS` (if set) will be matched against existing DB users during the Prisma migration, which sets `role: "admin"` for the first user and `role: "user"` for others.

**Alternatives considered**:
- **Seed script**: Requires separate deployment step. Rejected for complexity.
- **Env var for initial admin email**: Defeats the purpose of removing env-based config. Rejected.
- **First user in DB by createdAt becomes admin**: Migration script approach. Works but the signIn-callback approach handles both fresh and existing cases.

## Decision 4: Migration Strategy for Existing Users

**Decision**: Prisma migration adds `role` (default `"user"`) and `isActive` (default `true`) columns. A post-migration data script sets the first existing user (by `createdAt`) to `role: "admin"`.

**Rationale**:
- All existing users get `isActive: true` automatically via default — no access disruption.
- All existing users get `role: "user"` via default — safe.
- A one-time server action or migration script promotes the earliest user to admin.
- `AUTHORIZED_EMAILS` env var is ignored after migration — no code reads it.

**Alternatives considered**:
- **Match AUTHORIZED_EMAILS to DB users**: Would require parsing the env var during migration. Adds complexity for little benefit since there are at most 5 users. Rejected.
- **Manual admin assignment via DB**: Requires database access. Defeats purpose. Rejected.

## Decision 5: Admin UI Location

**Decision**: New route at `/settings/admin` with a server component page and a client component for the interactive user list. Linked from the settings page with an admin-only section.

**Rationale**:
- Consistent with existing navigation: settings is where user-management belongs.
- Admin-only visibility: section only renders if `session.user.role === "admin"`.
- Keeps admin UI simple: a list with action buttons (deactivate/reactivate/promote).

**Alternatives considered**:
- **Separate `/admin` top-level route**: Over-engineered for 1-2 screens. Rejected.
- **Modal within settings page**: Too cramped for a user list. Rejected.

## Decision 6: User Cap Implementation

**Decision**: `MAX_USERS` environment variable (default: 200). Checked in the `signIn` callback before creating a new user. If count >= cap, return `false` with a redirect to an error page.

**Rationale**:
- Environment variable allows adjustment without code changes.
- Check happens at sign-in time, not on every request (only new registrations need cap enforcement).
- Existing users are never affected by the cap.

**Alternatives considered**:
- **Database-stored cap (admin-configurable)**: More flexible but adds a new settings field + UI for something that rarely changes. Over-engineered. Rejected.
- **No cap**: Risk of unexpected costs. Rejected per user requirement.

## Decision 7: Deactivated User Experience

**Decision**: Deactivated users who try to access the app are redirected to the sign-in page with an `?error=AccountInactive` query parameter. The sign-in page displays a clear "Your account has been deactivated" message.

**Rationale**:
- Reuses existing error display pattern on the sign-in page.
- No new page needed.
- Clear, non-generic message per spec requirement.

**Alternatives considered**:
- **Dedicated `/account-inactive` page**: Extra page for a rare edge case. Rejected.
- **Generic "access denied" message**: Spec explicitly requires a clear inactive message. Rejected.

## Decision 8: Removing authorized-emails.ts

**Decision**: Delete `src/lib/authorized-emails.ts` entirely. Remove all imports. The `AUTHORIZED_EMAILS` env var becomes a no-op.

**Rationale**:
- Clean break — no legacy code paths to maintain.
- All callers (auth.ts, auth.config.ts, signin page) will be updated to use DB-driven logic.
- The env var can remain set without harm (nothing reads it).

**Alternatives considered**:
- **Keep as fallback**: Adds code paths, testing surface, and confusion. Rejected per clarification (fully deprecate).
