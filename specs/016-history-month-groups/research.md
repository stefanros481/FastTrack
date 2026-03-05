# Research: History Month Groups

**Branch**: `016-history-month-groups` | **Date**: 2026-03-05

## Research Topics

### 1. Grouping Strategy

**Decision**: Group sessions client-side after fetching, using a utility function that transforms a flat `CompletedSession[]` into `Map<string, CompletedSession[]>` keyed by `"YYYY-MM"` derived from `startedAt`.

**Rationale**: Sessions are already fetched in reverse chronological order by the existing `/api/sessions` endpoint. Client-side grouping is trivial and avoids any API changes. The flat array naturally produces contiguous month groups since it's sorted by date.

**Alternatives considered**:
- Server-side grouping in API response — Over-engineered; adds API complexity for no benefit. Client already has all the data needed.
- Grouping by `endedAt` — Less intuitive; a fast that started on Feb 28 and ended March 1 would appear in March. `startedAt` is the natural user-facing date.

### 2. Month Key Format

**Decision**: Use `"YYYY-MM"` as the internal grouping key (e.g., `"2026-03"`). Display label is derived from the key using `toLocaleDateString` with `{ month: "long", year: "numeric" }`.

**Rationale**: `YYYY-MM` sorts lexicographically in chronological order, making it trivial to maintain reverse-chrono ordering. Locale-formatted display labels handle internationalization automatically.

**Alternatives considered**:
- Using the display label as the key (e.g., "March 2026") — Locale-dependent, brittle for comparison and deduplication.

### 3. Collapse/Expand State Management

**Decision**: Use a `Set<string>` of expanded month keys stored in component state. On initial load, add only the first (most recent) month key to the set. Toggling adds/removes keys from the set.

**Rationale**: A `Set` provides O(1) lookup for expanded state per group. This is simpler than a `Map<string, boolean>` and naturally handles the "only current month expanded" default.

**Alternatives considered**:
- `Record<string, boolean>` — Works but requires explicit `false` entries for every collapsed month.
- Single `expandedMonth: string | null` — Doesn't support having multiple months expanded simultaneously.

### 4. Infinite Scroll Integration

**Decision**: Keep the existing flat `sessions` state and pagination logic unchanged. Derive month groups from the flat array on every render using `useMemo`. When new sessions load via infinite scroll, the flat array grows and the grouping automatically updates.

**Rationale**: This avoids any changes to the fetch/pagination logic. The grouping is a pure derivation of existing state. `useMemo` ensures the grouping is only recomputed when sessions change.

**Alternatives considered**:
- Storing sessions in a grouped data structure — Complicates the pagination append logic and deletion handling.
- Grouping on fetch only — Would miss regrouping when sessions are deleted.

### 5. Animation for Collapse/Expand

**Decision**: Use CSS `grid-template-rows` transition for smooth height animation. Collapsed: `grid-template-rows: 0fr` with `overflow: hidden`. Expanded: `grid-template-rows: 1fr`. Wrap with `motion-safe:` prefix where applicable.

**Rationale**: This is the modern CSS approach for animating height from 0 to auto. No JavaScript height calculations needed. Works with dynamic content. Supported in all modern browsers.

**Alternatives considered**:
- `max-height` transition — Requires guessing a max-height value; causes animation timing issues.
- `display: none` toggle — No animation; abrupt.
- JavaScript height measurement — Over-engineered for this use case.

### 6. Chevron Animation

**Decision**: Use Lucide's `ChevronRight` icon with a CSS `rotate` transition. Collapsed: `rotate-0` (pointing right). Expanded: `rotate-90` (pointing down). Transition: `transition-transform duration-200`.

**Rationale**: Consistent with existing `ChevronRight` usage in `SessionCard.tsx`. Rotation is a simple, performant transform animation.

### 7. Component Architecture

**Decision**: Extract a `MonthGroup` component that receives the month key, sessions array, expanded state, and toggle callback. `HistoryList` remains the data-fetching orchestrator and renders a list of `MonthGroup` components.

**Rationale**: Keeps `HistoryList` focused on data fetching, pagination, and modal management. `MonthGroup` encapsulates the header + collapse + session rendering. Clean separation of concerns.

**Alternatives considered**:
- Inline everything in `HistoryList` — Makes the already-complex component harder to read.
- Separate `MonthHeader` component — Too granular; the header and collapsible body are tightly coupled.
