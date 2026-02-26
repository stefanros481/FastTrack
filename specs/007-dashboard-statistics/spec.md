# Feature Specification: Dashboard Statistics

**Feature Branch**: `007-dashboard-statistics`
**Created**: 2026-02-26
**Status**: Draft
**Input**: User description: "Dashboard Statistics — summary stat cards showing total fasts, average duration, longest fast, current streak, best streak, and weekly/monthly summaries"

## User Scenarios & Testing

### User Story 1 - View Summary Statistics (Priority: P1)

As a user, I want to see key fasting statistics displayed as cards on my dashboard so that I can quickly understand my overall fasting behavior at a glance.

**Why this priority**: This is the core value of the feature — surfacing aggregate insights from historical fasting data. Without stat cards, the dashboard only shows raw session history with no summarized view.

**Independent Test**: Can be fully tested by completing several fasting sessions and navigating to the dashboard. Delivers immediate value by showing total fasts, average duration, and longest fast.

**Acceptance Scenarios**:

1. **Given** the user has completed fasting sessions, **When** they navigate to the dashboard, **Then** they see stat cards displaying: total fasts, average duration, and longest fast.
2. **Given** the user has no completed fasting sessions, **When** they navigate to the dashboard, **Then** they see stat cards with zero states: "0" for total fasts, "0h 0m" for durations, "0 days" for streaks, "0 fasts" / "0h" for period summaries.
3. **Given** the user has an active (in-progress) fasting session, **When** they view statistics, **Then** the active session is excluded from all aggregate calculations (only completed sessions count).

---

### User Story 2 - View Streak Statistics (Priority: P2)

As a user, I want to see my current fasting streak and best-ever streak so that I feel motivated to maintain consistency.

**Why this priority**: Streaks are a powerful motivational tool. They build on the base statistics and add a gamification element that encourages daily fasting habits.

**Independent Test**: Can be tested by completing fasts on consecutive days and verifying the streak count increments correctly. Delivers motivational value through visible consistency tracking.

**Acceptance Scenarios**:

1. **Given** the user has completed fasts on 3 consecutive days (including today), **When** they view the dashboard, **Then** the current streak shows "3 days".
2. **Given** the user missed yesterday but fasted the 5 days before that, **When** they view the dashboard, **Then** the current streak shows "0 days" and best streak shows "5 days".
3. **Given** the user has never fasted, **When** they view the dashboard, **Then** both current streak and best streak show "0 days".
4. **Given** the user completed multiple fasts on the same day, **When** streaks are calculated, **Then** that day counts as one streak day (not multiple).

---

### User Story 3 - View Weekly and Monthly Summaries (Priority: P3)

As a user, I want to see how many fasts I completed and total hours fasted this week and this month so that I can track my short-term progress.

**Why this priority**: Time-bounded summaries provide actionable context — users can see if they're on track for the current week/month without scrolling through history.

**Independent Test**: Can be tested by completing fasts within the current week and month, then verifying the counts and total hours are accurate.

**Acceptance Scenarios**:

1. **Given** the user completed 3 fasts totaling 48 hours this week, **When** they view the dashboard, **Then** the "This Week" card shows "3 fasts" and "48 hours".
2. **Given** it is the first day of the week and the user has not fasted yet, **When** they view the dashboard, **Then** the "This Week" card shows "0 fasts" and "0 hours".
3. **Given** the user completed 10 fasts totaling 160 hours this month, **When** they view the dashboard, **Then** the "This Month" card shows "10 fasts" and "160 hours".

---

### User Story 4 - Statistics Loading State (Priority: P4)

As a user, I want to see a loading indicator while statistics are being calculated so that I know the dashboard is working and not broken.

**Why this priority**: Loading states prevent confusion and perceived brokenness. Lower priority because it's a UX polish item, not core functionality.

**Independent Test**: Can be tested by observing the dashboard on initial load — skeleton placeholders should appear briefly before real data renders.

**Acceptance Scenarios**:

1. **Given** statistics are being loaded, **When** the user views the dashboard, **Then** they see skeleton placeholder cards matching the dimensions of real stat cards.
2. **Given** statistics finish loading, **When** data is ready, **Then** skeleton cards are replaced with actual stat cards with a smooth entrance animation.

---

### Edge Cases

- What happens when a fasting session spans midnight (crosses day boundaries)? The session counts toward the day it was completed (ended).
- What happens when durations are very long (e.g., multi-day fasts)? Durations display in hours and minutes regardless of length (e.g., "72h 30m").
- What happens when the user's timezone changes? All statistics use server time based on session timestamps. "This week" and "this month" boundaries are computed server-side using `new Date()` (server clock). For a single-user Vercel deployment, server and user time zones are assumed to be close enough; no client-side timezone adjustment is performed.
- What happens when a session has no end time (was abandoned or is in progress)? It is excluded from all statistics — only completed sessions with both start and end times are counted.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display the total number of completed fasting sessions.
- **FR-002**: System MUST display the average duration across all completed fasting sessions, formatted in hours and minutes.
- **FR-003**: System MUST display the longest single fasting session duration, formatted in hours and minutes.
- **FR-004**: System MUST display the current streak as the number of consecutive days (up to and including today) with at least one completed fast.
- **FR-005**: System MUST display the best streak as the longest consecutive-day streak ever achieved.
- **FR-006**: System MUST display a "This Week" summary showing the count of completed fasts and total hours fasted in the current ISO week (Monday–Sunday).
- **FR-007**: System MUST display a "This Month" summary showing the count of completed fasts and total hours fasted in the current calendar month.
- **FR-008**: System MUST exclude in-progress (active) fasting sessions from all statistics calculations.
- **FR-009**: System MUST show skeleton loading placeholders while statistics are being computed.
- **FR-010**: System MUST refresh statistics each time the user navigates to the dashboard.
- **FR-011**: System MUST display zero/empty states when the user has no completed sessions (e.g., "0 fasts", "0h 0m" for durations, "0 days" for streaks).
- **FR-012**: System MUST count multiple fasts completed on the same calendar day as a single streak day.

### Key Entities

- **Fasting Session**: A record of a completed fast with start time, end time, and computed duration. Only sessions with both start and end times are included in statistics.
- **Streak**: A derived calculation representing consecutive calendar days with at least one completed fasting session. Not a stored entity — computed on demand.
- **Period Summary**: A derived calculation aggregating fast count and total hours for a bounded time period (current week or current month). Computed on demand.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can view all seven statistics (total fasts, average duration, longest fast, current streak, best streak, this week summary, this month summary) on a single dashboard screen without scrolling past the statistics section.
- **SC-002**: Statistics are displayed within 2 seconds of navigating to the dashboard.
- **SC-003**: Loading placeholders are visible during data fetch, eliminating layout shift when data appears.
- **SC-004**: All statistics are accurate to within 1 minute of precision for duration-based metrics.
- **SC-005**: Streak calculations correctly handle edge cases: same-day multiple fasts, day boundaries, and gaps in fasting history.

## Assumptions

- "Consecutive days" for streak calculation uses calendar days based on session end time.
- ISO 8601 week definition is used (weeks start on Monday).
- Duration formatting uses hours and minutes (e.g., "16h 30m"), not days.
- Statistics are scoped to the single authenticated user — no multi-user considerations needed.
- Statistics are computed fresh on each dashboard visit (no caching layer needed for a single-user app).
