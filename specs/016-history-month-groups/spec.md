# Feature Specification: History Month Groups

**Feature Branch**: `016-history-month-groups`
**Created**: 2026-03-05
**Status**: Draft
**Input**: User description: "Since we start to get a lot of entries in the log tab, I think it would be the best to have a foldable based on month."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Grouped by Month (Priority: P1)

When a user opens the Log tab, fasting sessions are organized under month headers (e.g., "March 2026", "February 2026") instead of displayed as a flat list. Each month group shows all sessions from that month in reverse chronological order (newest first). This makes it immediately clear which sessions belong to which time period.

**Why this priority**: This is the core value — without grouping, there is no structure to navigate. This alone solves the problem of a growing, hard-to-scan flat list.

**Independent Test**: Open the Log tab with 20+ sessions spanning multiple months. Sessions appear under labeled month headers, each showing the correct sessions for that month.

**Acceptance Scenarios**:

1. **Given** the user has sessions in March 2026 and February 2026, **When** they open the Log tab, **Then** sessions are grouped under "March 2026" and "February 2026" headers in reverse chronological order (most recent month first).
2. **Given** the user has sessions only in one month, **When** they open the Log tab, **Then** sessions appear under a single month header with no visual difference from today's behavior except the added header.
3. **Given** sessions load via infinite scroll and a new page contains sessions from a month already displayed, **When** the new page loads, **Then** the new sessions are appended under the existing month header (no duplicate headers).

---

### User Story 2 — Collapse and Expand Month Sections (Priority: P2)

Each month header is tappable and toggles the visibility of its sessions. Users can collapse months they're not interested in to quickly reach older entries. By default, the current month is expanded and all previous months are collapsed.

**Why this priority**: Collapsibility is what makes grouping truly useful for navigation. Without it, grouping is just cosmetic. However, grouping alone (US1) still improves readability.

**Independent Test**: Open the Log tab with sessions in 3+ months. Current month is expanded showing its sessions. Previous months show only their header with a session count. Tap a collapsed month header — it expands to reveal sessions. Tap an expanded month header — it collapses.

**Acceptance Scenarios**:

1. **Given** the user has sessions in March 2026, February 2026, and January 2026, **When** they open the Log tab in March 2026, **Then** March 2026 is expanded (sessions visible) and February/January are collapsed (sessions hidden).
2. **Given** a month section is collapsed, **When** the user taps the month header, **Then** the section expands to reveal its sessions.
3. **Given** a month section is expanded, **When** the user taps the month header, **Then** the section collapses to hide its sessions.
4. **Given** a collapsed month header, **Then** it displays the number of sessions in that month (e.g., "February 2026 (8 sessions)").

---

### User Story 3 — Expand/Collapse Indicator (Priority: P3)

Each month header shows a visual indicator (e.g., chevron arrow) that communicates whether the section is expanded or collapsed. The chevron rotates smoothly when toggling.

**Why this priority**: This is a polish enhancement that improves discoverability of the collapse/expand behavior. The feature works without it, but it's clearer with a visual cue.

**Independent Test**: Open the Log tab. Collapsed months show a right-pointing chevron; expanded months show a down-pointing chevron. Tapping a header smoothly rotates the chevron.

**Acceptance Scenarios**:

1. **Given** a collapsed month section, **Then** a right-pointing chevron is displayed on the month header.
2. **Given** an expanded month section, **Then** a down-pointing chevron is displayed on the month header.
3. **Given** the user taps a month header, **Then** the chevron rotates smoothly (animated transition).

---

### Edge Cases

- What happens when all sessions are in the same month? A single month header is shown, expanded, with all sessions visible beneath it.
- What happens when infinite scroll loads sessions from a new month not yet displayed? A new collapsed month header is inserted at the correct chronological position.
- What happens when infinite scroll loads more sessions for an already-displayed month? Sessions are appended to the existing month group without creating a duplicate header.
- What happens when a session is deleted from a month that only has one session? The month header is removed along with the session.
- What happens on a fresh account with no sessions? The existing empty state ("No fasting sessions yet") is displayed — no month headers appear.
- What happens when the user's locale formats month names differently? Month labels follow the user's browser locale settings.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST group completed fasting sessions by the month in which they started, displayed under a month header label (e.g., "March 2026").
- **FR-002**: Month groups MUST be ordered in reverse chronological order (most recent month first).
- **FR-003**: Sessions within each month group MUST maintain their existing order (newest first).
- **FR-004**: Each month header MUST be tappable to toggle the visibility of its sessions.
- **FR-005**: By default on page load, the most recent month MUST be expanded and all other months MUST be collapsed.
- **FR-006**: Collapsed month headers MUST display a session count (e.g., "February 2026 (8 sessions)").
- **FR-007**: Month headers MUST display a chevron indicator showing expanded/collapsed state.
- **FR-008**: The chevron MUST animate smoothly when toggling (rotation transition).
- **FR-009**: Infinite scroll MUST continue to work — loading more sessions appends them to the correct month group or creates new month groups as needed.
- **FR-010**: Month header labels MUST use the user's browser locale for month name formatting.
- **FR-011**: Month headers MUST meet the minimum touch target size (44x44px) for tappability.
- **FR-012**: Collapse/expand animations MUST respect the user's reduced-motion preferences.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify which month a session belongs to without reading individual session dates.
- **SC-002**: Users can collapse all months and see an overview of their fasting history by month with session counts, within a single scroll view (for up to 12 months).
- **SC-003**: Navigating to a session from 3+ months ago requires fewer than 3 taps (collapse current month, scroll, expand target month).
- **SC-004**: The Log tab loads and displays grouped sessions within the same time as the current flat list (no perceptible delay added by grouping).
- **SC-005**: Infinite scroll continues to function seamlessly — users do not notice any difference in scroll-loading behavior compared to the flat list.

## Assumptions

- Sessions are grouped by the month of their `startedAt` date, not `endedAt`.
- Month labels are formatted in the user's browser locale (e.g., "March 2026" in English, "mars 2026" in French).
- The collapse/expand state is not persisted across page refreshes — it resets to default (current month expanded, others collapsed) on each visit.
- Session count in collapsed headers reflects currently loaded sessions only (not total server-side count for that month).
- Existing session card design and detail modal behavior remain unchanged.
