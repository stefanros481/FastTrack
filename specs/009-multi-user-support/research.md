# Research: Multi-User Support

**Feature**: 009-multi-user-support
**Date**: 2026-02-27

## R-001: Auth.js Middleware for Per-Request Allowlist Validation

**Decision**: Use Auth.js `authorized` callback in `auth.config.ts` combined with Next.js `middleware.ts` at project root. The `authorized` callback runs on every request matched by middleware and has access to the `auth` object (JWT token). Check the user's email from the token against the parsed `AUTHORIZED_EMAILS` list.

**Rationale**: Auth.js v5 provides the `authorized` callback specifically for middleware-level access control. It runs at the edge (no Prisma/DB access needed) and receives the decoded JWT. This is the idiomatic approach — no custom JWT decoding required.

**Alternatives considered**:
- Custom middleware with manual JWT decoding — rejected because Auth.js already provides this mechanism
- Database lookup in middleware — rejected because edge runtime cannot use Prisma; also unnecessary since the allowlist is env-var-based

## R-002: Edge-Compatible Email Parsing

**Decision**: Create a standalone `src/lib/authorized-emails.ts` utility that parses `AUTHORIZED_EMAILS` (with `AUTHORIZED_EMAIL` fallback). This module must be edge-runtime compatible (no Node.js-only APIs, no Prisma imports).

**Rationale**: The email parsing logic is needed in three contexts:
1. `middleware.ts` / `auth.config.ts` `authorized` callback (edge runtime)
2. `auth.ts` `signIn` callback (Node.js runtime)
3. `auth.config.ts` dev credentials provider (Node.js runtime)

A shared utility avoids duplication and ensures consistent parsing (trim, lowercase, dedupe, max 5).

**Alternatives considered**:
- Inline parsing in each file — rejected for DRY violation and inconsistency risk
- Parse once at module load vs. on every call — parsing a 5-entry CSV is negligible; on-every-call is simpler and picks up env var changes in dev

## R-003: Dev Credentials Multi-User Support

**Decision**: Modify the dev credentials provider to accept an `email` field in credentials. The sign-in page shows a dropdown of all authorized emails (parsed from `AUTHORIZED_EMAILS`). When a developer selects an email and clicks "Dev Login", it passes that email to the credentials provider's `authorize()` function. The provider creates a user object with the selected email.

**Rationale**: This approach:
- Mirrors the real multi-user sign-in flow for accurate testing
- Requires minimal changes to the existing credentials provider
- The dropdown is only rendered in development mode (no production impact)

**Alternatives considered**:
- Query parameter approach (`?email=...`) — rejected as less discoverable
- Multiple separate dev login buttons — rejected as cluttered for 5 users

## R-004: Middleware File Location and Auth.js Integration

**Decision**: Create `middleware.ts` at project root (Next.js convention). Export the middleware from Auth.js using `auth.config.ts` (edge-compatible config without Prisma). The `authorized` callback in `authConfig` checks both authentication status AND allowlist membership.

**Rationale**: Currently no `middleware.ts` exists (CLAUDE.md references it but it was never created). Auth.js v5 provides `NextAuth(authConfig).auth` which can be exported directly as the middleware function. Using `auth.config.ts` (not `auth.ts`) avoids importing Prisma in edge runtime.

**Alternatives considered**:
- Custom middleware that wraps Auth.js — more complex, no benefit
- Checking allowlist only in `auth.ts` callbacks — doesn't satisfy FR-011 (per-request validation for immediate revocation)

## R-005: Backward Compatibility Strategy

**Decision**: In `getAuthorizedEmails()`, check `AUTHORIZED_EMAILS` first; if empty/undefined, fall back to `AUTHORIZED_EMAIL` (singular). Log a deprecation notice in development mode when the singular form is used. No code changes needed for data migration — the existing `User` record is matched by email (upsert), so switching env vars preserves all data.

**Rationale**: Zero-downtime upgrade path. Existing deployments continue working with `AUTHORIZED_EMAIL` until the owner updates to `AUTHORIZED_EMAILS`. No database changes needed since the schema already supports multiple users.

**Alternatives considered**:
- Breaking change (remove `AUTHORIZED_EMAIL` support) — rejected per FR-007
- Auto-migration script — unnecessary since it's just an env var rename

## R-006: Auth.js `authorized` Callback — Token Email Access

**Decision**: The JWT token in Auth.js v5 includes the user's email by default (from the OAuth profile). The `authorized` callback receives `{ auth }` where `auth.user.email` contains the email. This is sufficient for allowlist checking without additional token customization.

**Rationale**: Confirmed by Auth.js v5 behavior — the default JWT token includes email from the OAuth provider profile. No custom `jwt` callback changes needed for this purpose.

**Alternatives considered**:
- Storing email explicitly in JWT via custom callback — unnecessary, already included by default
