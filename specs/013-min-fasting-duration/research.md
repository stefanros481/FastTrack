# Research: Minimum Fasting Duration Enforcement

**Feature Branch**: `013-min-fasting-duration`
**Date**: 2026-03-03

## R1: How to conditionally delete vs. save a session on long-press completion

**Decision**: Modify `handleLongPressComplete` in `FastingTimer.tsx` to check elapsed duration against 12 hours (720 minutes). If under 12h, call `deleteSession(currentFast.id)` instead of `stopFast(currentFast.id)`. If 12h or more, call `stopFast()` as before.

**Rationale**: `deleteSession()` already exists in `src/app/actions/fasting.ts` (lines 104-124) and performs a hard-delete with user-scoping. `stopFast()` sets `endedAt` and keeps the session. No new server action is needed — the conditional logic lives entirely in the client callback.

**Alternatives considered**:
- New `cancelFast()` server action: Rejected — `deleteSession()` already does the same thing (hard-delete by ID with userId scoping). Adding a new action would be redundant.
- Server-side duration check in `stopFast()`: Rejected — the server would need to decide whether to delete or save, adding complexity. The client already knows the elapsed time and can dispatch to the correct action.

## R2: How to change the ring label based on elapsed duration

**Decision**: Pass a new `isBelowMinimum` boolean prop to `ProgressRing`. Derive it in `FastingTimer.tsx` from `elapsedSeconds < 720 * 60` (43200 seconds = 12 hours). Use this prop to switch the hint text from "Hold ring to end" to "Hold ring to cancel" and the active press text from "Hold to end..." to "Hold to cancel...".

**Rationale**: The label text is currently hardcoded in `ProgressRing.tsx` (lines 131-152). Adding a single boolean prop keeps the component interface clean and the logic simple. The `ProgressRing` doesn't need to know what 12 hours means — it just renders based on the prop.

**Alternatives considered**:
- Pass a string label prop: More flexible but over-engineered for two states.
- Compute inside ProgressRing: Rejected — ProgressRing is a pure display component and shouldn't own business logic.

## R3: How to enforce minimum duration in session edits

**Decision**: Add a new `.refine()` check to `sessionEditSchema` in `src/lib/validators.ts` that verifies `endedAt - startedAt >= 12 hours`. This provides both client-side (realtime in `SessionDetailModal`) and server-side (in `updateSession()`) enforcement with a single schema change.

**Rationale**: The existing validation pattern uses Zod `.refine()` chains on `sessionEditSchema` which is shared between client and server. Adding one more refinement follows the established pattern perfectly. The error will automatically appear below the relevant date picker via the existing `errors` state in `SessionDetailModal.tsx`.

**Alternatives considered**:
- Separate server-side check only: Rejected — would miss the existing client-side real-time validation that provides immediate feedback.
- Database constraint: Rejected — a CHECK constraint on `endedAt - startedAt` would be brittle and couldn't produce user-friendly error messages.

## R4: Real-time label transition at the 12-hour mark

**Decision**: The `elapsedSeconds` state in `FastingTimer.tsx` already updates every second via `setInterval`. The derived `isBelowMinimum` boolean will naturally flip from `true` to `false` when `elapsedSeconds` crosses 43200 (12h × 3600s). No additional timer or polling is needed — React's re-render cycle handles the transition.

**Rationale**: The timer already runs at 1-second intervals (lines ~220-240 in `FastingTimer.tsx`). The boolean comparison re-evaluates on each render, so the UI transition is automatic and precise to the second.

**Alternatives considered**:
- `setTimeout` at exactly the 12h mark: Rejected — fragile if the component remounts, and unnecessary given the existing interval.

## R5: Server-side enforcement for the cancel path

**Decision**: Add a duration check to the `stopFast()` server action. Before setting `endedAt`, check if `now - startedAt < 12 hours`. If so, return an error. This prevents a tampered client from calling `stopFast()` on a sub-12h session.

**Rationale**: Constitution Principle IV (Data Integrity) requires server-side validation for all mutations. The client dispatches to `deleteSession()` for sub-12h, but a malicious or buggy client could still call `stopFast()` directly. The server must be the authoritative gate.

**Alternatives considered**:
- Trust the client: Rejected — violates Constitution Principle II (Security by Default) and Principle IV (Data Integrity).
