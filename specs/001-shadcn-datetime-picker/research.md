# Research: ShadCN 24-Hour Date & Time Picker

**Feature**: 001-shadcn-datetime-picker
**Date**: 2026-02-28

## Decision Log

### 1. ScrollArea component availability

**Decision**: Add `ScrollArea` via the `shadcn` CLI (`bunx shadcn add scroll-area`).

**Rationale**: `radix-ui` v1.4.3 (the unified package) is already installed — it includes the underlying `@radix-ui/react-scroll-area` primitives. The `shadcn` CLI (v3.8.5, in devDependencies) wraps these into a styled, project-consistent component. One CLI command adds `src/components/ui/scroll-area.tsx` with zero new npm dependencies.

**Alternatives considered**:
- Hand-roll a plain `<div style={{ overflowY: 'auto' }}>` — rejected because it skips the styled scrollbar Radix provides and diverges from the project's ShadCN component convention.
- Native browser scrollbar — rejected because it renders inconsistently across mobile browsers.

---

### 2. CalendarIcon source

**Decision**: Use `lucide-react` `CalendarIcon` instead of `@radix-ui/react-icons` `CalendarIcon`.

**Rationale**: The project's existing `calendar.tsx` already uses `lucide-react` icons exclusively. The constitution (Principle V) states "Do not mix icon libraries." `@radix-ui/react-icons` is not installed and would be a new dependency for an identical icon.

**Alternatives considered**:
- Install `@radix-ui/react-icons` — rejected; adds a dependency solely to replicate an icon already available in `lucide-react`.

---

### 3. Component interface strategy

**Decision**: Keep the existing `DateTimePicker` component interface (`value: Date`, `onChange: (date: Date) => void`, `error?: boolean`) and replace only the implementation inside `src/components/ui/date-time-picker.tsx`.

**Rationale**: `SessionDetailModal.tsx` already imports `DateTimePicker` with this exact interface. No changes to the modal, validation logic, or any other consumer are required — only the internal rendering changes. This is the minimum-change approach aligned with Principle V (Premium Simplicity).

**Alternatives considered**:
- Create a new `DateTimePicker24h` component and update all imports — rejected; unnecessary rename with no benefit.
- Change the interface signature — rejected; would require cascading updates to `SessionDetailModal`, `sessionEditSchema`, and validation hooks.

---

### 4. Minute pre-selection snapping for non-5 values

**Decision**: When a stored minute is not a multiple of 5, round DOWN to the nearest 5 (`Math.floor(minutes / 5) * 5`) for pre-selection in the scroll list.

**Rationale**: Round-down is predictable and consistent (e.g. 11:37 → 11:35, never jumps forward in time). User confirmed 5-minute granularity is acceptable. On save, the rounded value is persisted.

**Alternatives considered**:
- Round to nearest (37 → 35) — nearly identical; chose floor to avoid ever selecting a time "in the future" relative to the stored value.
- Preserve exact minute without snapping — rejected; impossible since 37 is not a selectable option in the 5-step list.

---

### 5. Hour pre-scroll into view

**Decision**: Use a `useEffect` with `scrollIntoView({ block: 'center' })` triggered when the popover opens, targeting the currently-selected hour and minute button elements.

**Rationale**: The scroll columns are virtualized as a tall list; the selected item may not be visible without scrolling. `scrollIntoView` is the standard browser API for this, widely supported, and requires no additional dependency. This satisfies SC-002.

**Alternatives considered**:
- Manual scroll offset calculation — fragile, depends on fixed button heights.
- `react-virtual` or similar — overkill for a 24-item and 12-item list.
