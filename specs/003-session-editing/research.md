# Research: Session Editing

**Feature**: 003-session-editing
**Date**: 2026-02-26

## R1: Date/Time Input on Mobile

**Decision**: Use native HTML `<input type="datetime-local">` for date/time picking.

**Rationale**: Native datetime-local inputs are well-supported on iOS Safari and Android Chrome, providing platform-native date/time pickers without any JS library. They respect the user's locale and feel natural on mobile. The alternative (a custom React date picker component) adds bundle size and complexity for no benefit in a single-user personal app.

**Alternatives considered**:
- react-datepicker: Adds ~30KB, requires custom mobile styling, unnecessary for this use case.
- Custom popover with scroll wheels: High implementation effort, prone to accessibility issues.

## R2: Overlap Detection Query Strategy

**Decision**: Server-side overlap detection via a single Prisma query that checks for any session (excluding the one being edited) whose time range intersects with the proposed new range.

**Rationale**: The SQL overlap condition is: `existing.startedAt < proposed.endedAt AND existing.endedAt > proposed.startedAt`. This is a standard interval overlap check. With ~50 sessions per user, no index optimization is needed beyond the existing `userId` filter.

**Client-side overlap check**: Not feasible without fetching all sessions to the client. Instead, client-side validation handles only the synchronous checks (time ordering, future time). Overlap is validated server-side only, with the error returned to the client on save attempt.

**Alternatives considered**:
- Fetch all sessions client-side for local overlap check: Adds complexity, data transfer, and stale-data risk. Not worth it for ~50 sessions.
- Database constraint: PostgreSQL doesn't natively support range non-overlap constraints without extensions (e.g., `btree_gist` + `EXCLUDE`). Overkill for single-user app.

## R3: Zod Validation Schema Design

**Decision**: Create a shared Zod schema in `src/lib/validators.ts` that validates:
1. `startedAt` is a valid Date
2. `endedAt` is a valid Date
3. `startedAt < endedAt`
4. Neither time is in the future

**Rationale**: Constitution Principle IV requires Zod schemas for client+server validation. A shared schema file ensures both sides use identical rules. The schema is imported by both the modal component (client-side) and the server action (server-side).

**Alternatives considered**:
- Inline validation without Zod: Violates constitution Principle IV.
- Separate client/server schemas: Risk of divergence; single source of truth is better.

## R4: Modal Dismiss Behavior

**Decision**: Modal can be dismissed by tapping a close/X button or tapping the backdrop overlay. Both discard unsaved changes without confirmation (per spec FR-012).

**Rationale**: The modal only contains two editable fields. The cost of re-editing is low. Adding a "discard changes?" confirmation would violate Principle I (adds an extra tap) and Principle V (unnecessary complexity).

**Alternatives considered**:
- Confirm before discard: Adds friction for a low-stakes action. Rejected per Principle I.
