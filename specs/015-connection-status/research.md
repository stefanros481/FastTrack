# Research: Database Connection Status Indicator

**Branch**: `015-connection-status` | **Date**: 2026-03-05

## Research Topics

### 1. Health Check Endpoint Pattern

**Decision**: Use a lightweight `GET /api/health` route that executes `SELECT 1` via Prisma's `$queryRaw`.

**Rationale**: This is the simplest possible database connectivity check. It verifies that:
- The Next.js serverless function is running
- The Prisma client can connect to the database
- The database is awake and accepting queries

`SELECT 1` has negligible overhead and is the standard health check pattern for PostgreSQL.

**Alternatives considered**:
- `prisma.$connect()` — Less explicit; doesn't verify query execution works
- Querying a real table (e.g., `SELECT COUNT(*) FROM "User"`) — Unnecessary overhead; `SELECT 1` is sufficient
- No auth on health check — Rejected; constitution requires all non-auth routes to be protected

### 2. Authentication on Health Check

**Decision**: The health check endpoint MUST verify the auth session before executing the database query, consistent with all other API routes in the project.

**Rationale**: Constitution Principle II requires all routes outside `/auth/*` and `/api/auth/*` to be protected by middleware and verify the authenticated session. `/api/health` is not exempt.

**Implication**: The health check only works for authenticated users. This is fine since the status indicator is only relevant after login.

### 3. Client-Side Polling Strategy

**Decision**: Use a custom `useConnectionStatus` hook that:
1. Fires an initial `fetch('/api/health')` on mount
2. On failure, retries every 5 seconds using `setInterval`
3. On success, clears the interval and stops polling

**Rationale**: Follows existing hook patterns in the project (`useChartData`, `useGoalNotification`). The 5-second retry interval balances responsiveness with server load. Since Neon cold starts typically take 5-10 seconds, the first retry often succeeds.

**Alternatives considered**:
- Exponential backoff — Over-engineered for up to 5 users; fixed 5s interval is simpler
- `navigator.onLine` API — Only detects network connectivity, not database availability
- Server-Sent Events — Over-engineered; simple polling is sufficient for this use case
- `SWR` or `React Query` — Not in the project's dependencies; would be added complexity for one use case

### 4. UI Indicator Placement and Design

**Decision**: Small pill badge positioned in the header, before the ThemeToggle button (right side of header). Uses existing design tokens:
- Connecting: `--color-warning` (yellow) + `motion-safe:animate-pulse`
- Online: `--color-success` (green) + fade-out after 3s
- Offline: `--color-error` (red) + persistent

**Rationale**: The header already has a right-aligned ThemeToggle. Adding the status indicator to its left keeps the header balanced. The pill badge pattern is unobtrusive and familiar.

**Alternatives considered**:
- Full-width banner — Too disruptive for a small personal app
- Toast-style notification — Would conflict with existing toast system
- Icon-only (no text) — Less clear, especially for the "Connecting" state

### 5. Disabling the Start Fast Button

**Decision**: Pass the connection status as a prop to `FastingTimer`. When status is not "online", the "Start Fast" button receives `disabled={true}` with reduced opacity.

**Rationale**: The simplest approach. The button already has an `isPending` disabled state, so the pattern is established.

**Alternatives considered**:
- React Context for connection status — Over-engineered; only one component needs the status
- Blocking the entire page with an overlay — Too aggressive; spec says only Start Fast is blocked

### 6. Health Check Timeout

**Decision**: Use the browser's default `fetch` timeout (varies by browser, typically 60-120s). No explicit `AbortController` timeout.

**Rationale**: The Neon cold start is the primary delay (5-10s). Setting a short timeout (e.g., 5s) would cause false "Offline" states during wake-up. The indicator shows "Connecting..." throughout, which is the correct UX. If the request truly hangs, the user can refresh.

**Alternatives considered**:
- Explicit 10s timeout with AbortController — Would cause a brief "Offline" flash before retry succeeds during cold start; worse UX
- Explicit 30s timeout — Reasonable but adds complexity with minimal benefit

### 7. Fade-Out Animation for "Online" State

**Decision**: Use CSS `opacity` transition with a 3-second delay triggered by a state change. After the fade completes, unmount the component via `onTransitionEnd` or a timeout.

**Rationale**: Consistent with existing animation patterns (all use `transform` and/or `opacity`). No new keyframes needed — can use inline `transition` + conditional opacity class.

**Alternatives considered**:
- New `@keyframes fade-out` — Works but inline transition is simpler for a single-use case
- Just unmounting after 3s (no animation) — Abrupt; fade is more polished
