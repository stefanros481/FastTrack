# Feature Specification: Remove Reminder Functionality

**Feature Branch**: `022-remove-reminders`
**Created**: 2026-03-11
**Status**: Draft
**Input**: User description: "The reminder is not a function I want to keep in the application. Please remove it from the settings page and any related functionality in the application."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Notifications Settings Without Reminder (Priority: P1)

As a user, when I visit the Settings page, I should only see the "Max Duration Alert" option in the Notifications section. The "Daily Reminder" toggle and "Reminder Time" picker should no longer appear.

**Why this priority**: This is the primary user-facing change — the reminder UI must be removed from the settings page so users are no longer presented with non-functional controls.

**Independent Test**: Can be fully tested by navigating to Settings and verifying that the Notifications section only shows the Max Duration Alert input, with no Daily Reminder toggle or Reminder Time picker visible.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they navigate to the Settings page, **Then** the Notifications section does not display a "Daily Reminder" toggle
2. **Given** a logged-in user, **When** they navigate to the Settings page, **Then** the Notifications section does not display a "Reminder Time" picker
3. **Given** a logged-in user, **When** they navigate to the Settings page, **Then** the Notifications section still displays the "Max Duration Alert" input and it functions correctly

---

### User Story 2 - Clean Removal of Reminder Backend Logic (Priority: P2)

As a developer/maintainer, the reminder-related server actions (fetching and updating reminder settings) and validation schemas should be removed so that no dead code remains in the codebase.

**Why this priority**: Dead code creates confusion and maintenance burden. Removing it ensures a clean codebase, but this is secondary to the user-facing change.

**Independent Test**: Can be verified by searching the codebase for reminder-related functions (`updateReminderSettings`, `reminderTimeSchema`) and confirming they no longer exist, and that the application builds and runs without errors.

**Acceptance Scenarios**:

1. **Given** the codebase after removal, **When** a developer searches for `updateReminderSettings`, **Then** no results are found
2. **Given** the codebase after removal, **When** a developer searches for `reminderTimeSchema`, **Then** no results are found
3. **Given** the codebase after removal, **When** the application is built, **Then** it compiles without errors

---

### User Story 3 - Database Schema Deprecation of Reminder Fields (Priority: P3)

The database schema should no longer include reminder-related fields (`reminderEnabled`, `reminderTime`) on the UserSettings model. A migration should remove these columns.

**Why this priority**: While the UI and backend logic removal (P1/P2) make the fields unused, keeping unused columns in the database adds confusion. However, this can be deferred if there are concerns about data loss or migration timing.

**Independent Test**: Can be verified by inspecting the Prisma schema and running a migration that drops the `reminderEnabled` and `reminderTime` columns from the `UserSettings` table.

**Acceptance Scenarios**:

1. **Given** the updated Prisma schema, **When** a developer inspects the `UserSettings` model, **Then** `reminderEnabled` and `reminderTime` fields are not present
2. **Given** the migration is applied, **When** querying the `UserSettings` table directly, **Then** the `reminder_enabled` and `reminder_time` columns do not exist

---

### Edge Cases

- What happens to existing users who had `reminderEnabled: true`? The fields are simply dropped; since reminders were never actually sent (no push notification infrastructure), no user-facing behavior changes.
- What if the NotificationSettings component becomes empty after removing reminders? It still has the "Max Duration Alert" feature, so the component and Notifications section remain.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Settings page MUST NOT display a "Daily Reminder" toggle in the Notifications section
- **FR-002**: The Settings page MUST NOT display a "Reminder Time" picker in the Notifications section
- **FR-003**: The Settings page MUST continue to display the "Max Duration Alert" input in the Notifications section with full functionality
- **FR-004**: The system MUST remove the `updateReminderSettings` server action
- **FR-005**: The system MUST remove the `reminderTimeSchema` validation schema
- **FR-006**: The system MUST remove the `reminderEnabled` and `reminderTime` fields from the `UserSettings` database model
- **FR-007**: The system MUST remove associated test code for reminder-related validators
- **FR-008**: The `getNotificationSettings` server action MUST no longer return `reminderEnabled` or `reminderTime` fields
- **FR-009**: The application MUST build and function correctly after all removals

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero reminder-related UI controls visible on the Settings page
- **SC-002**: Zero references to reminder functionality in application source code (excluding migration files and git history)
- **SC-003**: Application builds successfully with no compilation errors after removal
- **SC-004**: All remaining Settings page functionality (Max Duration Alert, Default Goal, Theme, etc.) continues to work correctly
- **SC-005**: Database migration completes successfully, removing the two deprecated columns

## Assumptions

- Reminders were never actively sent (no push notification infrastructure exists), so removing them has no impact on user-facing notification behavior
- The "Max Duration Alert" feature is independent of reminders and will remain fully functional
- Existing data in `reminderEnabled` and `reminderTime` columns can be safely discarded
- The `WheelTimePicker` component may still be used elsewhere (e.g., notification time settings); only remove it if it becomes unused after this change
