# Implementation Plan: Long-Press Progress Ring to End Session

**Branch**: `012-long-press-end-session` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-long-press-end-session/spec.md`

## Summary

Replace the "End Fast" button with a long-press gesture on the progress ring. Users press and hold the ring for 5 seconds while an inner red confirmation circle fills up, providing clear visual feedback. Releasing early cancels the action. All active sessions (including no-goal) display a progress ring. A persistent "Hold ring to end" hint and a visually hidden accessible fallback ensure discoverability and inclusivity.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+
**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React
**Storage**: N/A — no database changes
**Testing**: Manual testing (project has no automated test suite)
**Target Platform**: Mobile-first web app (375px+ viewport), desktop secondary
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: 60fps animation during long-press hold; 5-second timer accuracy within 200ms
**Constraints**: Touch target ≥ 44×44px (progress ring is 240×240px); CSS keyframe animations use only `transform` and `opacity` per design system — the confirmation circle is JS-driven SVG state (`strokeDashoffset`), not a CSS keyframe, so this constraint does not apply
**Scale/Scope**: 2 components modified, 1 new hook

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Mobile-First, Single-Interaction UX | Core actions ≤ 2 taps; 44×44px touch targets | PASS | Long-press is a single continuous gesture (0 taps). Ring is 240×240px. The hold replaces a 2-tap flow (End Fast → Confirm End). |
| II. Security by Default | Auth checks on mutations | PASS | Uses existing `stopFast` server action which already validates auth session and scopes by userId. No new endpoints. |
| III. Server-First Architecture | Client components only where interactivity required | PASS | Long-press is inherently interactive. ProgressRing is already a client component. Mutation uses existing server action. |
| IV. Data Integrity & Validation | Zod validation; no overlapping sessions | PASS | No new mutations. Uses existing `stopFast(sessionId)` which already validates. |
| V. Premium Simplicity | Design tokens; motion-safe animations; no scope creep | PASS | Confirmation circle uses `--color-error` token. Hold animation is functional (like shake) so does NOT use `motion-safe:`. Hint text entrance uses `motion-safe:`. No features beyond spec scope. |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/012-long-press-end-session/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (no schema changes)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── hooks/
│   ├── useChartData.ts          # existing
│   ├── useGoalNotification.ts   # existing
│   └── useLongPress.ts          # NEW — long-press gesture hook
├── components/
│   ├── ProgressRing.tsx         # MODIFIED — add confirmation circle, long-press handling, hint text
│   └── FastingTimer.tsx         # MODIFIED — remove End Fast button/confirm flow, always use ProgressRing
```

**Structure Decision**: Pure frontend change within existing component structure. One new hook file, two modified components. No new pages, routes, API endpoints, or database changes. No CSS keyframe additions needed — confirmation circle is JS-driven via SVG `strokeDashoffset` (per research.md R2).

## Implementation Approach

### New Hook: `useLongPress`

A custom React hook that encapsulates the long-press gesture logic:
- Tracks pointer state (pressed/released) via `onPointerDown`, `onPointerUp`, `onPointerLeave`, `onPointerCancel`
- Uses `requestAnimationFrame` loop to calculate elapsed hold time from wall-clock (`performance.now()`)
- Returns: `{ progress: number (0-1), isPressed: boolean, handlers: PointerEventHandlers }`
- Calls `onComplete` callback when progress reaches 1.0
- Resets on release or pointer leave
- Configurable hold duration (default 5000ms)

### ProgressRing Changes

- Accept new props: `onLongPressComplete`, `isPressed`, `longPressProgress` (from hook state)
- Render a second SVG `<circle>` inside the ring (smaller radius, red stroke `--color-error`) whose `strokeDashoffset` is driven by the long-press progress value
- Show "Hold to end..." text (replacing the percent/remaining text) while pressed
- Show "Session ended" briefly on completion
- Show persistent "Hold ring to end" hint below the ring (muted text)
- Add `sr-only` button as accessible fallback for ending the session
- Attach pointer event handlers from `useLongPress` to the ring container

### FastingTimer Changes

- Remove `confirmingEnd` state and `handleCancelEnd`
- Remove the "End Fast" / "Confirm End" button block entirely
- Always render `<ProgressRing>` for active sessions (no more plain timer card branch)
- For no-goal sessions, pass a default 16h reference (already exists as `targetSeconds` fallback)
- Pass `stopFast` callback to ProgressRing's `onLongPressComplete`
- Keep the "Start Fast" button for idle state (unchanged)
