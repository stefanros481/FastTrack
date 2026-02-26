# Feature Specification: Dashboard Charts

**Feature Branch**: `008-dashboard-charts`
**Created**: 2026-02-26
**Status**: Draft
**Input**: User description: "Dashboard Charts - duration chart, weekly totals chart, and goal hit rate donut chart"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Fasting Duration Chart (Priority: P1)

As a user, I want to see a bar chart of my fasting durations over time so I can spot trends and see whether my fasts are getting longer or shorter.

The dashboard's Insights view shows a bar chart where each bar represents one completed fasting session. The x-axis shows dates and the y-axis shows duration in hours. I can switch between 7-day, 30-day, and 90-day views using pill-shaped buttons above the chart. If I have a default fasting goal set, a horizontal dashed line appears on the chart showing my goal duration, making it easy to see which sessions met the target.

**Why this priority**: The duration chart provides the most direct visual insight into fasting behavior over time. It answers the fundamental question "Am I improving?" and is the most commonly expected chart type in health tracking apps.

**Independent Test**: Navigate to dashboard with at least 3 completed fasts across different days. See a bar chart with one bar per session. Switch between time ranges and verify the chart updates correctly.

**Acceptance Scenarios**:

1. **Given** I have 5 completed fasts in the last 7 days, **When** I view the dashboard and select "7 days", **Then** I see a bar chart with 5 bars showing each session's duration in hours.
2. **Given** I have a default fasting goal of 16 hours, **When** I view the duration chart, **Then** a horizontal dashed line appears at the 16-hour mark.
3. **Given** I have no completed fasts in the last 7 days but have fasts in the last 30 days, **When** I select "7 days", **Then** I see an empty state message. **When** I switch to "30 days", **Then** I see the chart with my sessions.
4. **Given** I have completed fasts, **When** I switch between "7 days", "30 days", and "90 days", **Then** the chart smoothly updates to show only sessions within the selected range.

---

### User Story 2 - View Weekly Totals Chart (Priority: P2)

As a user, I want to see how many total hours I fasted each week so I can track my consistency over time.

The dashboard shows a bar chart where each bar represents one week and the height shows total hours fasted that week. The chart displays the last 8 to 12 weeks, giving a medium-term view of fasting habits. Weeks with no fasting show as zero-height bars.

**Why this priority**: Weekly aggregation reveals consistency patterns that individual session data cannot. It helps users understand their overall fasting volume and identify weeks where they fell off.

**Independent Test**: Complete fasts across at least 3 different weeks. See a bar chart with one bar per week showing total hours. Verify zero-height bars for weeks with no activity.

**Acceptance Scenarios**:

1. **Given** I have completed fasts spanning 4 different weeks, **When** I view the weekly totals chart, **Then** I see bars for each of those weeks with heights proportional to total hours fasted.
2. **Given** I have a week with no completed fasts between two active weeks, **When** I view the chart, **Then** the inactive week shows as a zero-height bar (no gap in the sequence).
3. **Given** I have no completed fasts at all, **When** I view the weekly totals chart, **Then** I see an empty state with a message encouraging me to start fasting.

---

### User Story 3 - View Goal Hit Rate (Priority: P3)

As a user, I want to see what percentage of my fasts hit the goal so I know how disciplined I have been.

The dashboard shows a donut (ring) chart displaying the goal hit rate as a percentage. The denominator is the number of completed sessions that had a goal set. The numerator is the number of those sessions where the actual duration met or exceeded the goal. The percentage is displayed prominently in the center of the donut. Sessions without a goal are excluded from this calculation.

**Why this priority**: Goal adherence is a motivational metric but requires the user to have set goals on their fasts. It's less universally useful than trend and consistency charts but adds accountability.

**Independent Test**: Complete at least 3 fasts with goals set, where some meet the goal and some don't. See a donut chart showing the correct hit/miss percentage.

**Acceptance Scenarios**:

1. **Given** I have 10 completed fasts with goals, 7 of which met or exceeded the goal, **When** I view the goal hit rate chart, **Then** I see a donut chart showing "70%" in the center.
2. **Given** I have completed fasts but none of them had a goal set, **When** I view the goal hit rate section, **Then** I see an empty state indicating no goals have been tracked.
3. **Given** all my fasts with goals met the goal, **When** I view the chart, **Then** I see "100%" with the full ring filled in the success color.
4. **Given** I have no completed fasts, **When** I view the goal hit rate section, **Then** I see the same empty state as when no data exists.

---

### User Story 4 - Charts Loading State (Priority: P4)

As a user, I want the charts area to show appropriate loading indicators while data is being fetched, so the page doesn't appear broken during loading.

**Why this priority**: Loading states are a polish concern. Charts may take slightly longer to render than stat cards since they involve more data processing and rendering. A smooth loading experience prevents confusion.

**Independent Test**: Throttle network in DevTools, navigate to dashboard, observe placeholder/skeleton appearing before charts render.

**Acceptance Scenarios**:

1. **Given** the dashboard is loading chart data, **When** I navigate to the Insights view, **Then** I see placeholder skeletons matching the chart card dimensions.
2. **Given** chart data has loaded, **When** the charts appear, **Then** they animate in smoothly without layout shift.

---

### Edge Cases

- What happens when a user has only 1 completed fast? Charts should still render with a single data point (one bar, one week).
- What happens when all fasts are on the same day? The duration chart shows multiple bars for that day; the weekly chart shows one bar for that week.
- What happens when a user has hundreds of sessions in a 90-day window? The duration chart should remain performant and readable (bars may become narrow but should not overlap).
- What happens when the user has fasts with very short durations (e.g., under 1 hour)? Bars should still be visible, even if small.
- What happens when the user's default goal changes? The goal line on the duration chart should reflect the current default goal, not historical per-session goals.
- What happens on a narrow mobile viewport (375px)? Charts should scale down proportionally, remaining legible with appropriately sized labels.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a duration bar chart showing individual session durations over a selectable time range.
- **FR-002**: System MUST provide time range selection with options for 7 days, 30 days, and 90 days, defaulting to 7 days.
- **FR-003**: System MUST overlay a horizontal goal line on the duration chart when the user has a default fasting goal set.
- **FR-004**: System MUST display a weekly totals bar chart showing total fasting hours per week for the last 8-12 weeks.
- **FR-005**: System MUST display a donut chart showing the percentage of goal-meeting fasts out of all fasts that had a goal set.
- **FR-006**: System MUST exclude active (in-progress) sessions from all chart calculations.
- **FR-007**: System MUST exclude sessions without a goal from the goal hit rate calculation (both numerator and denominator).
- **FR-008**: System MUST show an empty state with an appropriate message when no data is available for any chart.
- **FR-009**: System MUST render all charts responsively, scaling to fit viewports as narrow as 375px without horizontal scrolling.
- **FR-010**: System MUST display loading skeletons while chart data is being fetched.
- **FR-011**: Charts MUST animate in with a smooth entrance transition when data loads.
- **FR-012**: The duration chart MUST show date labels on the x-axis and hour values on the y-axis.
- **FR-013**: The weekly totals chart MUST label each bar with the week start date (e.g., "Feb 17" for the week starting on that date).
- **FR-014**: The goal hit rate donut MUST show the percentage value prominently in the center of the ring.
- **FR-015**: System MUST fetch chart data from a dedicated data endpoint to separate chart data concerns from the existing stats data flow.

### Key Entities

- **Fasting Session**: Existing entity — the source data for all charts. Key attributes: start time, end time, goal duration (optional). Only completed sessions (with end time) are included.
- **User Settings**: Existing entity — provides the default fasting goal for the goal line overlay.
- **Chart Data**: Derived, non-persisted data. Aggregated views of fasting sessions (individual durations, weekly totals, goal hit counts) computed on request.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view their fasting duration trend within 2 seconds of navigating to the dashboard.
- **SC-002**: Users can switch between time ranges (7/30/90 days) and see the chart update within 1 second.
- **SC-003**: All three charts render correctly on viewports from 375px to 1440px wide without horizontal scrolling or overlapping elements.
- **SC-004**: Charts display accurate data matching the values shown in the stat cards and history list.
- **SC-005**: Empty states are shown appropriately when no data exists, guiding users toward their first fast.
- **SC-006**: Loading skeletons appear immediately on navigation, preventing any flash of empty content before charts render.

## Scope

### In Scope

- Duration bar chart with 7/30/90 day time range selector
- Weekly totals bar chart (last 8-12 weeks)
- Goal hit rate donut chart
- Empty states for all charts
- Loading skeletons
- Responsive layout for mobile and desktop
- Data endpoint for chart-specific data

### Out of Scope

- Interactive chart features (tooltips on hover, click-to-drill-down)
- Exporting chart images or data
- Custom date range selection beyond the 7/30/90 day presets
- Comparison charts (e.g., this week vs. last week)
- Chart animations beyond entrance transitions

## Assumptions

- Charts will be rendered on the existing dashboard/Insights view alongside the stat cards added in Epic 7.
- The charting library (Recharts) specified in the project tech stack will be used for rendering.
- The x-axis date format follows the user's browser locale for consistency with the rest of the app.
- Week boundaries follow ISO 8601 (Monday start), consistent with the weekly stats in Epic 7.
- The "last 8-12 weeks" for the weekly chart means showing the most recent 12 ISO weeks, omitting trailing weeks with no data beyond the user's first session.
- The default fasting goal for the goal line overlay comes from the user's settings (not per-session goals).
- Chart data is fetched via a dedicated API route (GET endpoint) rather than a server action, since charts render client-side and benefit from GET request semantics and caching.

## Dependencies

- **Epic 7 (Dashboard Statistics)**: The stat cards from Epic 7 are already on the Insights view. Charts will be added below the stat cards.
- **Epic 2 (Session Lifecycle)**: Completed fasting sessions provide the source data.
- **Epic 5 (Fasting Goal)**: Default goal from user settings provides the goal line overlay value.
