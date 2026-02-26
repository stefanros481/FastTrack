# Research: Fasting Goal

**Feature**: 005-fasting-goal
**Date**: 2026-02-26

## R1: SVG Progress Ring Implementation

**Decision**: Use a native SVG `<circle>` with `stroke-dasharray` and `stroke-dashoffset` for the progress ring. No third-party library needed.

**Rationale**: The SVG circle technique is well-established for circular progress indicators. The circumference of the circle is calculated as `2 * π * r`, and `stroke-dashoffset` is set to `circumference * (1 - progress)` to show fill. This avoids adding a dependency for a single visual component. The ring animates smoothly via CSS `transition: stroke-dashoffset` on the SVG stroke.

**Alternatives considered**:
- Canvas-based ring: Rejected — SVG integrates better with React's declarative model and is accessible.
- Third-party progress ring library (e.g., react-circular-progressbar): Rejected — unnecessary dependency for a simple SVG technique; adds bundle size.

## R2: SVG Ring Layout & Timer Placement

**Decision**: The progress ring is rendered as an SVG element with the timer, percentage, and "time to go" positioned via absolute CSS inside a relative container that overlays the SVG.

**Rationale**: SVG `<text>` elements are harder to style with Tailwind. Using HTML elements absolutely positioned over the SVG ring gives full control over typography (font-mono, text-6xl) and design token compliance. The SVG handles only the ring visual; all text is HTML.

**Alternatives considered**:
- SVG `<text>` for labels: Rejected — cannot use Tailwind classes, harder to maintain consistency with design tokens.
- SVG `<foreignObject>`: Viable but has edge-case rendering issues on some mobile browsers.

## R3: Goal Pill Selector Design

**Decision**: Replace the existing `FASTING_PROTOCOLS` 2x2 card grid with a horizontal scrollable row of pill buttons (12h, 16h, 18h, 20h, 24h) plus a "Custom" pill that expands an inline input. Protocol subtitles are shown below the hour label on matching pills.

**Rationale**: Pills are more compact and mobile-friendly than cards. A horizontal row with `overflow-x-auto` handles 5+ items on narrow screens. The "Custom" pill toggling an input avoids a separate modal or screen.

**Alternatives considered**:
- Keeping the 2x2 grid and adding a 5th card for "Custom": Rejected — grid becomes awkward with 5 items; pills are a cleaner pattern for single-axis selection.
- Dropdown select: Rejected — dropdowns are poor for mobile touch targets and hide options.

## R4: Custom Goal Input Format

**Decision**: A single numeric input field that accepts hours (e.g., "14" or "15.5"). Shown inline below the pills when the "Custom" pill is selected. Validated with Zod: min 1, max 72, must be a positive number.

**Rationale**: A single hours field is the simplest input for mobile. Decimal hours (e.g., 15.5 = 15h 30m) handle fractional goals without needing separate hour/minute fields. The value is converted to minutes (`hours * 60`) before saving.

**Alternatives considered**:
- Two separate fields (hours + minutes): Rejected — more complex UI, harder to validate, and users think in hours for fasting.
- Time picker component: Rejected — overkill for a simple duration; adds dependency.

## R5: Browser Notification API Integration

**Decision**: Request notification permission when the user first starts a fast with a goal set. Use the `Notification` constructor to fire notifications. Track "notified" state in a React ref to prevent duplicates. Fall back to in-app toast if `Notification.permission === "denied"` or `!("Notification" in window)`.

**Rationale**: Requesting permission at the moment of goal-setting is contextual and more likely to be granted than an upfront prompt. The `Notification` API is supported in all modern browsers. The ref-based tracking avoids re-rendering and is reset when a new session starts.

**Alternatives considered**:
- Service Worker push notifications: Rejected — overkill for a single-user app where the tab is open; push notifications require a backend push server.
- Requesting permission on page load: Rejected — browsers increasingly block non-contextual permission requests.

## R6: In-App Toast Component

**Decision**: Create a simple `Toast` component using `position: fixed` at the bottom of the viewport. Uses `--color-success` background, white text, `rounded-xl`, `p-4`. Entrance via `motion-safe:animate-slide-up`. Auto-dismisses after 5 seconds via `setTimeout`; tap to dismiss via `onClick`. Managed via state in the parent component (FastingTimer).

**Rationale**: A lightweight custom toast avoids adding a toast library dependency. The component is reusable for future notification needs but simple enough for this use case.

**Alternatives considered**:
- react-hot-toast or sonner: Rejected — unnecessary dependency for a single-user app with one toast use case.
- Shadcn toast: Could work but adds complexity; a custom 20-line component is simpler.

## R7: Default Goal Server Action

**Decision**: Add `updateDefaultGoal(goalMinutes: number | null)` and `getDefaultGoal()` server actions in `src/app/actions/settings.ts`. The update action validates with Zod (same schema as custom goal) and writes to `UserSettings.defaultGoalMinutes`. The get action is called in `page.tsx` SSR to pass the value as a prop to FastingTimer.

**Rationale**: Follows the existing pattern in `settings.ts` (see `updateTheme`/`getTheme`). Server actions for mutations per Constitution Principle III. SSR data loading per the server-first architecture.

**Alternatives considered**:
- API route for default goal: Rejected — Constitution says mutations must use Server Actions; this is a simple settings mutation.

## R8: Celebration Animation

**Decision**: When the goal is reached, the ring stroke transitions to `--color-success` with a smooth CSS transition. A checkmark icon appears in the center with `motion-safe:animate-bounce-in` (a new keyframe: scale from 0 to 1.1 to 1 over 0.5s). The "X to go" text changes to "Goal reached!".

**Rationale**: Matches the epic's design spec (ring → success color, checkmark with bounce-in). Using CSS animations with `motion-safe:` prefix respects reduced-motion preferences per the constitution.

**Alternatives considered**:
- Confetti animation: Rejected — too complex and not specified in the epic; scope creep.
- No animation beyond color change: Rejected — the epic explicitly calls for a celebration animation.

## R9: No Database Migration Needed

**Decision**: No schema changes are required. `FastingSession.goalMinutes` (nullable Int) and `UserSettings.defaultGoalMinutes` (nullable Int) already exist in the Prisma schema.

**Rationale**: Both fields were added in earlier epics. The `startFast` server action already accepts `goalMinutes` as a parameter. The settings page just needs a new server action to read/write `defaultGoalMinutes`.
