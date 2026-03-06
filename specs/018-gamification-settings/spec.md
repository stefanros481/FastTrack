# Feature Specification: Gamification Settings & Opt-In

**Feature Branch**: `018-gamification-settings`
**Created**: 2026-03-06
**Status**: Draft
**Input**: User description: "Gamification settings and opt-in splash screen"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Opt-In Splash Screen (Priority: P1)

A new or existing user who has never been asked about gamification sees a one-time splash screen prompting them to opt in or opt out. The splash appears on the main timer view and blocks gamification content until the user makes a choice. The user can choose to join or decline, and the choice is persisted so the splash never appears again.

**Why this priority**: Without the opt-in decision, the system doesn't know whether to show gamification features. This is the gating mechanism for all other gamification functionality.

**Independent Test**: Can be fully tested by creating a user with no gamification preference set, loading the timer view, and verifying the splash appears with two clear options.

**Acceptance Scenarios**:

1. **Given** a user whose gamification preference has not been set, **When** they open the timer view, **Then** a splash screen overlay appears asking them to join or decline gamification.
2. **Given** the splash screen is displayed, **When** the user taps "Join In", **Then** gamification is enabled for them, the splash disappears, and it does not appear again on subsequent visits.
3. **Given** the splash screen is displayed, **When** the user taps "No Thanks", **Then** gamification is disabled for them, the splash disappears, and it does not appear again on subsequent visits.
4. **Given** a user who has already made a gamification choice, **When** they open the timer view, **Then** no splash screen appears.

---

### User Story 2 - Master Gamification Toggle in Settings (Priority: P1)

A user can go to the Settings page and toggle gamification on or off at any time. This overrides their initial opt-in/opt-out choice. When gamification is off, no gamification features are visible anywhere in the app.

**Why this priority**: Users must be able to change their mind after the initial splash. This is essential for user autonomy and trust.

**Independent Test**: Can be tested by navigating to Settings, toggling the gamification master switch, and verifying the setting persists across page reloads.

**Acceptance Scenarios**:

1. **Given** a user on the Settings page, **When** they view the Community section, **Then** they see a master "Enable Gamification" toggle.
2. **Given** gamification is enabled, **When** the user turns the master toggle off, **Then** the setting is saved immediately and all gamification features are hidden.
3. **Given** gamification is disabled, **When** the user turns the master toggle on, **Then** the setting is saved immediately and gamification features become available.

---

### User Story 3 - Individual Feature Toggles (Priority: P2)

A user who has gamification enabled can selectively enable or disable individual gamification features (Achievements, Who's Fasting Now, Leaderboard, Weekly Challenge) from the Settings page.

**Why this priority**: Provides granular control for users who want some gamification features but not others. Depends on the master toggle (P1) being in place.

**Independent Test**: Can be tested by enabling gamification, then toggling individual features on/off and verifying each toggle persists independently.

**Acceptance Scenarios**:

1. **Given** gamification is enabled, **When** the user views the Community section in Settings, **Then** they see 4 individual feature toggles below the master toggle.
2. **Given** gamification is enabled, **When** the user disables "Group Leaderboard", **Then** only the leaderboard feature is hidden while other features remain active.
3. **Given** gamification is disabled (master toggle off), **When** the user views the Community section, **Then** the individual feature toggles are hidden (not visible).
4. **Given** gamification is enabled and the user disables a feature, **When** they reload the Settings page, **Then** the toggle state is preserved.

---

### Edge Cases

- What happens when a user who opted out via splash later enables gamification in Settings? The master toggle in Settings overrides the splash choice; individual feature toggles default to all enabled.
- What happens if the database has no settings record for a user? The system creates default settings (gamification undecided, all features enabled by default) via existing user creation flow.
- What happens in dark mode? All splash screen and settings UI elements render correctly with design token colors.
- What happens if the server action fails while saving? The toggle reverts to its previous state visually (optimistic update rolls back).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST store a tri-state gamification preference per user: undecided (null), enabled (true), or disabled (false).
- **FR-002**: System MUST store individual on/off preferences for each of the 4 gamification features: Achievements, Who's Fasting Now, Leaderboard, Weekly Challenge.
- **FR-003**: System MUST display a one-time opt-in splash screen when the user's gamification preference is undecided.
- **FR-004**: System MUST persist the user's opt-in/opt-out choice so the splash screen does not reappear.
- **FR-005**: System MUST provide a master gamification toggle on the Settings page under a "Community" section.
- **FR-006**: System MUST provide 4 individual feature toggles on the Settings page, visible only when the master toggle is enabled.
- **FR-007**: System MUST save all gamification settings immediately upon toggle interaction (no save button required).
- **FR-008**: The splash screen MUST include informational text explaining what gamification features are available.
- **FR-009**: The splash screen MUST include a note that the user can change their preference later in Settings.

### Key Entities

- **User Gamification Preference**: Per-user setting indicating whether they have opted in, opted out, or not yet decided regarding gamification features.
- **Feature Toggles**: Per-user boolean preferences for each of the 4 gamification features (Achievements, Who's Fasting Now, Leaderboard, Weekly Challenge), defaulting to enabled.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of users are prompted with the opt-in splash on their first visit after the feature ships, and the splash does not reappear after a choice is made.
- **SC-002**: Users can toggle gamification settings (master and individual) and see the change reflected immediately without page reload.
- **SC-003**: Settings persist across sessions -- a user who opted out and returns days later still has gamification disabled.
- **SC-004**: The splash screen and settings UI render correctly in both light and dark modes on mobile viewports (375px+).
- **SC-005**: All gamification setting changes complete within 1 second from user interaction to confirmed persistence.
