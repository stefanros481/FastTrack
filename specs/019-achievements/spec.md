# Feature Specification: Achievements & Badges

**Feature Branch**: `019-achievements`
**Created**: 2026-03-06
**Status**: Draft
**Input**: User description: "Build the second part of the gamification. Achievements and badges - personal milestone badges computed from fasting session history."

## User Scenarios & Testing

### User Story 1 - View My Achievements (Priority: P1)

As a user, I want to see all available badges organized by category so I can understand what milestones I can work toward and which ones I've already earned.

**Why this priority**: The core value of the feature — without viewing badges, nothing else matters.

**Independent Test**: Navigate to the Community tab, see a grid of badges showing earned (highlighted) and locked (dimmed) states. Delivers immediate value by showing progress.

**Acceptance Scenarios**:

1. **Given** a user with gamification enabled and completed fasting sessions, **When** they navigate to the Community tab, **Then** they see a grid of badges organized by category with earned badges highlighted and locked badges dimmed.
2. **Given** a user with no completed sessions, **When** they view the achievements grid, **Then** all badges appear in a locked state with their unlock criteria visible.
3. **Given** a user with gamification disabled, **When** they navigate to the app, **Then** no achievements are shown anywhere.

---

### User Story 2 - Unlock Badge Celebration (Priority: P2)

As a user, when I earn a new badge after completing a fast, I want to see a celebratory animation so I feel rewarded and motivated to continue.

**Why this priority**: Celebration is the emotional payoff that drives engagement. Without it, badges feel static and unexciting.

**Independent Test**: Complete a fast that crosses a badge threshold (e.g., 10th total fast), return to the Community tab, and verify a celebration overlay appears for the newly earned badge.

**Acceptance Scenarios**:

1. **Given** a user who just completed their 10th fast (unlocking the "10 Fasts" badge), **When** they view the Community tab, **Then** a celebration overlay appears showing the newly unlocked badge with an animation.
2. **Given** a user who has already seen the celebration for a badge, **When** they return to the Community tab, **Then** the celebration does not appear again for that badge.
3. **Given** a user who unlocks multiple badges at once (e.g., first 18h fast also hits 10th total fast), **When** they view achievements, **Then** celebrations are shown sequentially for each new badge.

---

### User Story 3 - Community Tab & Navigation (Priority: P1)

As a user, I want a dedicated Community tab in the bottom navigation so I can access achievements and future social features from anywhere in the app.

**Why this priority**: The navigation change is infrastructure required for achievements and all subsequent gamification epics. Co-equal with P1 because viewing achievements requires this tab to exist.

**Independent Test**: Tap the Community tab in the bottom navigation, see the Community view load with the achievements section. Settings is accessible via a gear icon in the header.

**Acceptance Scenarios**:

1. **Given** any authenticated user with gamification enabled, **When** they look at the bottom navigation, **Then** they see four tabs: Timer, Insights, Community, Log.
2. **Given** any authenticated user with gamification enabled, **When** they tap the gear icon in the header, **Then** they navigate to the Settings page.
3. **Given** a user with gamification disabled, **When** they look at the bottom navigation, **Then** the Community tab is hidden and the original navigation is preserved (Timer, Insights, Log, Settings link).

---

### User Story 4 - Badge Progress Indicators (Priority: P3)

As a user, I want to see how close I am to earning the next badge in each category so I have a clear goal to work toward.

**Why this priority**: Nice-to-have enhancement that deepens engagement but is not essential for the core badge experience.

**Independent Test**: View a locked badge and see a progress indicator (e.g., "7/10 fasts") showing how close you are to unlocking it.

**Acceptance Scenarios**:

1. **Given** a user with 7 completed fasts, **When** they view the locked "10 Fasts" badge, **Then** they see progress text like "7/10" below the badge.
2. **Given** a user who has earned all badges in a category, **When** they view that category, **Then** no further progress indicators are shown (all badges are in earned state).

---

### Edge Cases

- What happens when a user has zero completed sessions? All badges show as locked with 0/N progress.
- What happens when a user opts out of gamification after earning badges? Badges are hidden from view but badge state is preserved (computed from session data, so re-enabling shows them again).
- What happens when session history is edited (start/end time changed)? Badge eligibility is recomputed from current session data on each view — edits are automatically reflected.
- What happens when a session is deleted? Badge counts adjust accordingly since badges are computed, not stored.
- How are streaks calculated when a user skips a day? A streak requires at least one completed session per calendar day. Skipping any day resets the streak to zero.

## Requirements

### Functional Requirements

- **FR-001**: System MUST compute badge eligibility from existing fasting session data without storing badge state in the database.
- **FR-002**: System MUST organize badges into five categories: Streak, Volume, Duration, Consistency, and Goals.
- **FR-003**: System MUST display badges in a grid layout with clear visual distinction between earned (unlocked) and unearned (locked) states.
- **FR-004**: System MUST show a celebration overlay when a user views newly earned badges for the first time, tracked via local device storage.
- **FR-005**: System MUST add a "Community" tab to the bottom navigation for users with gamification enabled, replacing the Settings link.
- **FR-006**: System MUST move the Settings link to a gear icon in the header area when gamification is enabled.
- **FR-007**: System MUST hide all gamification UI (Community tab, badges) when the user has gamification disabled.
- **FR-008**: System MUST cap duration-based achievement thresholds at 24 hours maximum (no badges for 36h+ or 48h+ fasts) per the health and safety guardrails.
- **FR-009**: System MUST show progress toward the next unearned badge in each category.
- **FR-010**: System MUST support sequential celebration display when multiple badges are unlocked simultaneously.

### Badge Definitions

| Category | Thresholds |
|----------|-----------|
| Streak | 3, 7, 14, 30, 60, 100 consecutive days |
| Volume | 10, 50, 100, 250, 500 total fasts |
| Duration | First 18h fast, first 24h fast, 100 total hours |
| Consistency | Perfect Week (7/7 days), Perfect Month |
| Goals | 10, 50, 100 goals met |

### Key Entities

- **Badge**: A milestone definition with category, threshold, label, and icon. Not stored in database — defined as application constants.
- **EarnedBadge**: A computed result indicating which badges a user has unlocked, derived from their session history. Includes progress toward next badge in each category.
- **Celebration**: A transient UI event triggered when a user sees a newly unlocked badge for the first time. Tracked via local device storage to prevent repeat celebrations.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can view all available badges and their earned status within 1 second of navigating to the Community tab.
- **SC-002**: Badge celebration appears within 1 second of viewing the Community tab after earning a new badge.
- **SC-003**: All badge computations produce correct results — streak, volume, duration, consistency, and goal badges match the user's actual session history.
- **SC-004**: Navigation change (Community tab and header gear icon) is fully functional on mobile viewports (375px+) with 44x44px minimum touch targets.
- **SC-005**: Duration badges are capped at 24 hours, with no badges awarded for fasts exceeding that threshold.

## Assumptions

- Badge eligibility is computed on-the-fly from session data via a server action (same pattern as `getStats()`), not stored in the database. This is performant for a small user base.
- "Celebration seen" state is tracked in local device storage (not in the database). This means celebrations may re-trigger on a new device, which is acceptable.
- A "day" for streak and consistency calculations uses the server-local calendar day (UTC on Vercel), consistent with existing streak calculation in `getStats()`. See research.md decision #1.
- "Perfect Week" uses ISO week (Monday to Sunday). "Perfect Month" uses calendar month boundaries.
- A "goal met" means the session's `goalMinutes` was set and the session duration met or exceeded it.
- The Community tab and navigation refactor is scoped to this epic since it's required for badge display and will be reused by subsequent gamification epics (Leaderboard, Challenge).
