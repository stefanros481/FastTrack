# Research: Backend Readiness Check

**Feature**: 020-backend-readiness
**Date**: 2026-03-06

## R1: Deep Health Check Strategy

**Decision**: Replace `SELECT 1` with a lightweight application-table query (`SELECT count(*) FROM "User" WHERE false`) plus an auth session validation check.

**Rationale**:
- `SELECT 1` only validates the raw database connection; it does not confirm the ORM can access application tables or that migrations have been applied.
- Querying with a `WHERE false` clause returns zero rows instantly but still validates table existence and Prisma's ability to generate the query. This is cheaper than `SELECT count(*)` on actual data.
- Auth check: calling `auth()` already validates the JWT session and the NextAuth configuration. If it returns a valid session, the auth subsystem is operational.
- Combined, these two checks cover: database connectivity, schema/migration integrity, ORM functionality, and auth subsystem health.

**Alternatives considered**:
- `prisma.user.count()` -- works but scans actual rows; slightly heavier. Rejected for being unnecessary when `WHERE false` validates the same schema path.
- `prisma.$queryRaw\`SELECT 1\`` (current) -- too shallow; doesn't validate ORM or schema. Rejected as insufficient per spec.
- Dedicated health table -- over-engineered for 5-user app. Rejected.

## R2: Client-Side Timeout Implementation

**Decision**: Use `AbortController` with a 10-second timeout on the `fetch()` call in `useConnectionStatus`.

**Rationale**:
- The `fetch` API natively supports `AbortController` via the `signal` option. Setting a 10-second timeout via `setTimeout` + `controller.abort()` is the standard pattern.
- This is simpler and more reliable than server-side timeout configuration, as it covers both network delays and slow server responses.
- On abort, the fetch throws an `AbortError` which is caught by the existing error handler, transitioning to "offline" state and triggering retry.

**Alternatives considered**:
- Server-side timeout via Prisma `$queryRaw` timeout option -- only covers DB query, not the full request lifecycle. Rejected as incomplete.
- Custom `Promise.race` with timeout -- functionally equivalent to AbortController but doesn't cancel the underlying request. Rejected.

## R3: Connection Context vs Prop Drilling

**Decision**: Create a `ConnectionContext` (React Context) at the app layout level to share connection status across all components.

**Rationale**:
- Currently, `useConnectionStatus()` is called only in `FastingTimer.tsx` and the status is not available to other components (settings, session detail, notes).
- Prop drilling from the page layout through multiple component layers is fragile and couples unrelated components.
- A context provider wrapping the main layout makes `useConnectionStatus()` available everywhere via `useConnection()` hook.
- The provider instantiates the polling logic once (not per-component), avoiding duplicate health check requests.

**Alternatives considered**:
- Zustand / external state library -- adds a dependency for a single boolean state. Rejected as over-engineered.
- Prop drilling from layout → page → components -- too many intermediaries (layout → page → FastingTimer, SettingsPage → DefaultGoalSetting, etc.). Rejected for coupling.
- Multiple independent `useConnectionStatus()` calls -- each would fire separate health check requests, multiplying load. Rejected.

## R4: ConnectionGuard Component Pattern

**Decision**: Create a reusable `ConnectionGuard` wrapper component that disables its child button and shows a tooltip on tap when offline.

**Rationale**:
- 6+ buttons across the app need the same disabled-when-offline behavior. Duplicating the logic in each component violates DRY.
- The guard wraps any button, reads connection status from context, and: (a) passes `disabled` prop when not online, (b) intercepts click/tap to show a brief tooltip message.
- Tooltip implemented as a temporary absolutely-positioned element that auto-dismisses after 2 seconds. No external tooltip library needed.

**Alternatives considered**:
- Custom hook `useRequireOnline()` returning `{ disabled, onClickWhenDisabled }` -- requires each button to wire up two props manually. Less ergonomic than a wrapper. Rejected.
- Global toast on any blocked action -- intrusive, spec says "tooltip on tap" not toast. Rejected.
- Higher-order component (HOC) -- less idiomatic in modern React than composition via wrapper. Rejected.

## R5: Granular Status States

**Decision**: Extend `ConnectionStatus` type from `"connecting" | "online" | "offline"` to `"connecting" | "online" | "offline" | "unavailable"`. Track retry count in the hook to determine transition.

**Rationale**:
- Spec requires distinguishing "warming up" (≤3 retries, shown as "Connecting...") from "unavailable" (>3 retries, shown as "Unavailable").
- Adding a `failCount` ref in the hook is trivial. When `failCount >= 3`, set status to `"unavailable"` instead of continuing with `"offline"`.
- The `ConnectionStatus` component maps the new state to a distinct label and color (red dot + "Unavailable" text).
- Reset `failCount` to 0 when a health check succeeds.

**Alternatives considered**:
- Keep three states and use a separate `isUnavailable` boolean -- splits the status into two variables, making consumption harder. Rejected.
- Time-based threshold (e.g., 15 seconds elapsed) instead of retry count -- equivalent in practice (3 retries × 5s = 15s) but harder to track accurately due to variable response times. Rejected for simplicity.

## R6: Health Check Response Shape

**Decision**: Return a JSON object with individual subsystem statuses: `{ status: "ok" | "error", checks: { database: "ok" | "error", auth: "ok" | "error" } }`.

**Rationale**:
- Spec FR-003 requires individual status per subsystem for granular client feedback.
- The `status` field is the aggregate: `"ok"` when all checks pass, `"error"` if any check fails.
- Client primarily uses HTTP status code (200 vs 503) for the binary online/offline decision, but can optionally parse `checks` for future diagnostic use.
- Keeping the response lightweight (no PII, no data counts) satisfies Constitution Principle II (Security by Default).

**Alternatives considered**:
- Simple `{ status: "ok" }` (current) -- doesn't satisfy FR-003 requirement for per-subsystem status. Rejected.
- Detailed error messages in response -- risks leaking internal details. Rejected for security.
