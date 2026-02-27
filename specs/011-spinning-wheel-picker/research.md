# Research: Spinning Wheel Date/Time Picker

## Decision 1: Third-Party Library Selection

**Decision**: Use `@ncdai/react-wheel-picker` (v1.2.0)

**Rationale**:
- Zero production dependencies — only React as peer dep
- Explicitly supports React 19 (`^19.0.0 || ^19.0.0-rc`)
- Momentum scrolling with cubic ease-out physics (velocity clamping, deceleration, boundary resistance)
- Keyboard navigation (arrow keys, Home/End, type-ahead)
- Infinite loop / wrap-around mode (`infinite` prop) — ideal for hour/minute drums
- Click-to-select support
- Theming via `classNames` prop with slots (`optionItem`, `highlightItem`, `highlightWrapper`) — fits Tailwind CSS directly
- Actively maintained: 14 releases from June 2024 through Feb 2026, backed by Vercel OSS Program
- ~12,000 weekly downloads, 659 GitHub stars

**Alternatives Considered**:
- `react-mobile-picker` (v1.2.0): Higher downloads (~17k/week) but no momentum/inertia physics, no keyboard navigation, no wrap-around, less actively maintained (last publish Aug 2025). Rejected because momentum scrolling is a core requirement.
- `react-simple-wheel-picker`: Last published 6 years ago. Rejected — abandoned.
- `react-date-wheel-picker`: Date-specific API, minimal adoption. Rejected — too narrow.
- `rmc-picker` / `m-picker` (Ant Design): Old codebase, not updated for React 19. Rejected.

**Installation**: `bun add @ncdai/react-wheel-picker`

## Decision 2: Bottom Sheet Implementation

**Decision**: Use a custom bottom sheet component built with existing app patterns (overlay + slide-up animation)

**Rationale**:
- The app already has the bottom sheet pattern in `SessionDetailModal.tsx` (fixed overlay + `animate-slide-up`)
- No need for a heavy bottom sheet library for this simple use case
- Reuses existing `animate-slide-up` keyframe from `globals.css`

**Alternatives Considered**:
- `react-spring-bottom-sheet`: Adds unnecessary dependency for a simple slide-up overlay
- `@radix-ui/react-dialog`: Already available in the project but modal-style, not bottom sheet

## Decision 3: Active Session Start Time Edit

**Decision**: Create a new server action `updateActiveStartTime` in `fasting.ts`

**Rationale**:
- The existing `updateSession` action is for completed sessions (requires both `startedAt` and `endedAt`)
- Active sessions only need `startedAt` updated — `endedAt` is null
- Validation: new start time must be in the past, must not overlap with previous completed sessions
- Reuses existing `getUserId()` auth pattern and `revalidatePath`

## Decision 4: Picker Configuration

**Decision**:
- Date/time picker: 3 drums — month/day (combined, covering past 90 days through today), hour (00–23), minute (00–59)
- Time-only picker: 2 drums — hour (00–23), minute (00–59)
- `visibleCount`: 8 (multiple of 4, shows enough context)
- `infinite`: true for hour and minute drums (wrap-around), false for date drum

**Rationale**:
- Combined month/day drum avoids invalid date combinations (e.g., Feb 30)
- 90-day range covers typical use case of editing recent sessions while keeping the drum scrollable
- 24-hour format is consistent with existing app behavior
- Wrap-around on time drums feels natural (23 → 00)
