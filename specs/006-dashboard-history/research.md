# Research: Dashboard — History

**Feature**: 006-dashboard-history
**Date**: 2026-02-26

## R-001: Cursor-Based Pagination with Prisma

**Decision**: Use Prisma's native cursor pagination with `cursor`, `skip: 1`, and `take` options, using the session `id` (cuid, primary key) as the cursor value.

**Rationale**: Prisma's cursor pagination is more efficient than offset-based pagination for growing datasets — it uses indexed lookups instead of scanning skipped rows. The `id` field is already a primary key (indexed), making it the ideal cursor. Using `skip: 1` excludes the cursor record itself, preventing duplicates between pages.

**Alternatives considered**:
- Offset pagination (`skip` + `take`): Simpler but degrades on large datasets; unstable when records are added/deleted between pages.
- Timestamp-based cursor (`startedAt`): Would work but `startedAt` is not unique — two sessions could theoretically share the same timestamp. `id` is guaranteed unique.

## R-002: API Route vs Server Action for Paginated Fetching

**Decision**: Use an API route (`GET /api/sessions`) for paginated history fetching from the client.

**Rationale**: The constitution (Principle III) explicitly allows API routes for GET semantics where server actions are semantically inappropriate. Infinite scroll requires client-side fetching triggered by scroll position, which maps naturally to HTTP GET requests. API routes also support standard HTTP caching headers if needed.

**Alternatives considered**:
- Server actions for pagination: Technically possible but semantically wrong for read-only GET operations. Server actions are designed for mutations.
- React Server Components with streaming: Would require page-level routing changes; doesn't fit the existing tabbed SPA architecture.

## R-003: Infinite Scroll Implementation

**Decision**: Use native `IntersectionObserver` API with a sentinel element at the bottom of the list. No external library needed.

**Rationale**: IntersectionObserver is a native browser API that runs off the main thread, making it efficient. The implementation is straightforward (15-20 lines) and avoids adding a dependency. React 19 hooks (`useEffect`, `useRef`) integrate cleanly.

**Alternatives considered**:
- `react-intersection-observer` library: Cleaner hook syntax but adds a dependency for a simple use case.
- Scroll event listener: Less efficient (runs on main thread), requires manual throttling/debouncing.
- "Load More" button: Explicit but requires an extra tap per page — violates the mobile-first friction principle.

## R-004: History View Architecture

**Decision**: Extract the history rendering from `FastingTimer.tsx` into a dedicated `HistoryList` component that manages its own pagination state and data fetching.

**Rationale**: The current `FastingTimer` is a monolithic component (~530 lines) that handles three views. Extracting the history view isolates pagination complexity, makes the component testable, and follows the single-responsibility principle. The `HistoryList` component will manage its own `sessions`, `cursor`, `hasMore`, and `isLoading` state.

**Alternatives considered**:
- Keep history inline in FastingTimer: Increases component complexity further; pagination state would pollute the timer component.
- Separate `/history` route: Would break the existing tabbed SPA architecture without clear benefit. The Log tab convention is established.

## R-005: Delete Session Implementation

**Decision**: Add a `deleteSession` server action in `src/app/actions/fasting.ts` with Zod validation of `sessionId` and `userId` ownership check. Add a delete button to `SessionDetailModal` with an inline confirmation prompt.

**Rationale**: Server actions are the correct pattern for mutations (Constitution Principle III). The confirmation prompt prevents accidental deletion. Hard delete (not soft delete) aligns with the spec's "permanent removal" requirement and keeps the data model simple.

**Alternatives considered**:
- Soft delete (add `deletedAt` column): Over-engineering for a single-user app. No undo requirement in spec.
- Separate delete confirmation modal: Adds unnecessary complexity. An inline confirmation within the existing modal is sufficient and keeps the interaction within 3 taps.

## R-006: Pagination Response Shape

**Decision**: API returns `{ data: Session[], nextCursor: string | null, hasMore: boolean }`.

**Rationale**: Including `hasMore` explicitly avoids the client needing to infer end-of-data from `data.length < pageSize` (which fails when the total is an exact multiple of page size). `nextCursor` being null signals no more pages.

**Alternatives considered**:
- Return total count: Requires an extra COUNT query; unnecessary for infinite scroll which only needs "is there more?".
- Link-based pagination (RFC 5988): Over-engineering for a single-client API.
