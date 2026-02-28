# Research: Long-Press Progress Ring to End Session

**Date**: 2026-02-28
**Feature**: 012-long-press-end-session

## R1: Long-Press Gesture Implementation in React

**Decision**: Use Pointer Events API with `requestAnimationFrame` for timing.

**Rationale**: Pointer Events unify touch, mouse, and pen input into a single event model. They're supported in all modern browsers and React has first-class support (`onPointerDown`, `onPointerUp`, `onPointerLeave`, `onPointerCancel`). Using `requestAnimationFrame` for progress tracking ensures smooth 60fps animation tied to wall-clock time via `performance.now()`, avoiding drift issues with `setInterval`.

**Alternatives considered**:
- Touch Events (`onTouchStart`/`onTouchEnd`): Doesn't cover mouse/pen. Would need parallel mouse event handlers. More code, less consistent.
- `setTimeout` with CSS animation: Simpler but decouples the JS timer from the visual animation. If the animation and timer diverge, the session could end before/after the visual reaches 100%.
- Third-party gesture library (e.g., `@use-gesture/react`): Adds a dependency for a single gesture. Overkill for this use case.

## R2: Confirmation Circle Animation Approach

**Decision**: SVG `strokeDashoffset` driven by JS state (same technique as existing ProgressRing).

**Rationale**: The existing `ProgressRing` already uses SVG circles with `strokeDasharray`/`strokeDashoffset` for the fasting progress arc. Using the same technique for the confirmation circle ensures visual consistency, avoids new rendering approaches, and allows the progress value from `useLongPress` to directly drive the offset. No CSS keyframes needed — the animation is frame-accurate because it's tied to `requestAnimationFrame`.

**Alternatives considered**:
- CSS `@keyframes` animation with `animation-play-state`: Elegant but hard to reset mid-animation and doesn't provide frame-accurate progress readback to JS.
- Canvas rendering: Unnecessary complexity; SVG is already the pattern here.
- Conic gradient fill: CSS `conic-gradient` could create a filling circle, but doesn't integrate well with SVG and has less precise control.

## R3: Pointer Leave Detection for Ring Area

**Decision**: Attach pointer events to the SVG container `<div>` (240×240px). Use `onPointerLeave` and `onPointerCancel` to cancel the hold.

**Rationale**: The ring container is a well-defined rectangular area. `onPointerLeave` fires when the pointer exits the element bounds, which naturally includes dragging a finger off the ring. `onPointerCancel` handles system interrupts (incoming call, OS gesture). Both should reset the hold state.

**Alternatives considered**:
- Hit-testing against the circular SVG path: More precise but unnecessarily complex. The square bounding box of the ring is a perfectly acceptable touch area.
- Using `setPointerCapture`: Would keep events flowing even after leaving the element. This is the opposite of what we want — we need leave detection to cancel the hold.

## R4: Accessible Fallback for Ending Sessions

**Decision**: Visually hidden `<button>` with `sr-only` class, positioned after the progress ring in DOM order.

**Rationale**: Screen readers navigate by DOM order and announce interactive elements. A `sr-only` button (Tailwind's visually hidden class) is focusable via keyboard Tab and announced by screen readers, but invisible to sighted users. It uses the existing `stopFast` server action directly (no long-press simulation needed).

**Alternatives considered**:
- `aria-label` on the ring with role="button": Makes the ring itself accessible but conflates the long-press visual interaction with the accessible action. Screen readers would need to simulate a long press, which isn't standard.
- Settings page fallback: Adds navigation overhead and is not discoverable during an active session.

## R5: Always Showing Progress Ring for No-Goal Sessions

**Decision**: Render `ProgressRing` for all active sessions. For no-goal sessions, use the existing 16-hour default reference (`16 * 3600` seconds, already defined in `FastingTimer.tsx` as `targetSeconds` fallback).

**Rationale**: The code already calculates `targetSeconds = goalMinutes ? goalMinutes * 60 : 16 * 3600`. The only change is to always render `ProgressRing` instead of conditionally showing a plain timer card. The 16h default is already the implicit reference in the timer view.

**Alternatives considered**:
- Hide percentage/remaining text for no-goal sessions: Could work but adds conditional rendering complexity. Keeping the existing display is simpler and still useful.
- Use a different default (e.g., 24h): 16h matches the most common intermittent fasting protocol and is already the codebase default.
