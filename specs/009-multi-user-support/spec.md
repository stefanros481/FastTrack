# Feature Specification: Multi-User Support

**Feature Branch**: `009-multi-user-support`
**Created**: 2026-02-27
**Status**: Draft
**Input**: User description: "Implement multi-user support (up to 5 authorized users) as outlined in PRD v2.1 and epic-01"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Owner Adds Authorized Users (Priority: P1)

The app owner updates the `AUTHORIZED_EMAILS` environment variable from a single email to a comma-separated list of up to 5 email addresses. Each listed email can now sign in with Google OAuth. Previously, only a single `AUTHORIZED_EMAIL` was supported.

**Why this priority**: This is the foundational change — without it, multiple users cannot sign in at all. Every other story depends on this.

**Independent Test**: Can be fully tested by setting `AUTHORIZED_EMAILS=alice@example.com,bob@example.com` and verifying both users can sign in while a third unauthorized email is rejected. Delivers multi-user access.

**Acceptance Scenarios**:

1. **Given** `AUTHORIZED_EMAILS` contains two email addresses, **When** the first user signs in with Google OAuth using a listed email, **Then** sign-in succeeds and a `User` record is created/upserted in the database
2. **Given** `AUTHORIZED_EMAILS` contains two email addresses, **When** the second user signs in with a different listed email, **Then** sign-in succeeds and a separate `User` record is created
3. **Given** `AUTHORIZED_EMAILS` contains two email addresses, **When** a user signs in with an unlisted email, **Then** sign-in is rejected with the error "This app is private. Access denied."
4. **Given** `AUTHORIZED_EMAILS` contains 6 or more email addresses, **When** the system validates the list, **Then** only the first 5 are accepted and additional entries are ignored
5. **Given** `AUTHORIZED_EMAILS` is empty or not set, **When** any user attempts to sign in, **Then** sign-in is rejected for all users

---

### User Story 2 - Data Isolation Between Users (Priority: P1)

Each authorized user has completely private fasting data. User A cannot see User B's fasting sessions, statistics, charts, or settings. All database queries are scoped to the authenticated user's `userId`.

**Why this priority**: Data privacy is a core requirement — without isolation, multi-user support is a security risk. Co-equal priority with US1 as both are needed for a viable multi-user system.

**Independent Test**: Can be tested by signing in as two different authorized users and verifying each sees only their own data. Delivers user privacy.

**Acceptance Scenarios**:

1. **Given** User A has 5 fasting sessions and User B has 3, **When** User A views the dashboard, **Then** User A sees only their 5 sessions
2. **Given** User A has 5 fasting sessions and User B has 3, **When** User B views the dashboard, **Then** User B sees only their 3 sessions
3. **Given** User A has a default goal of 16 hours, **When** User B views settings, **Then** User B sees their own default settings (not User A's)
4. **Given** User A has an active fast, **When** User B opens the home page, **Then** User B sees the "Start Fast" state (not User A's active fast)

---

### User Story 3 - Independent User Settings (Priority: P2)

Each user gets their own `UserSettings` record on first sign-in with default values. Users can configure their own fasting goal, reminders, theme, and other preferences independently.

**Why this priority**: Settings isolation is important for a good multi-user experience, but the app is still functional with shared defaults. Depends on US1 and US2.

**Independent Test**: Can be tested by having two users set different default goals and themes, then verifying each sees their own preferences on next visit. Delivers independent configuration.

**Acceptance Scenarios**:

1. **Given** a new authorized user signs in for the first time, **When** sign-in completes, **Then** a `UserSettings` record is created with default values for that user
2. **Given** User A sets a default goal of 18 hours and dark theme, **When** User B sets a default goal of 16 hours and light theme, **Then** each user sees their own settings on subsequent visits
3. **Given** User A changes their reminder preferences, **When** User B views their settings, **Then** User B's reminder preferences are unaffected

---

### User Story 4 - Backward Compatibility Migration (Priority: P2)

The transition from `AUTHORIZED_EMAIL` (singular) to `AUTHORIZED_EMAILS` (plural) is handled gracefully. Existing single-user deployments continue to work during the transition, and the existing user's data is preserved.

**Why this priority**: Essential for existing deployments to upgrade without data loss or downtime, but not needed for greenfield installs.

**Independent Test**: Can be tested by deploying with old `AUTHORIZED_EMAIL` env var set (without `AUTHORIZED_EMAILS`) and verifying the existing user can still sign in. Delivers zero-downtime migration.

**Acceptance Scenarios**:

1. **Given** only `AUTHORIZED_EMAIL` (singular) is set in the environment, **When** the app starts, **Then** it falls back to treating that single email as the only authorized user (backward compatibility)
2. **Given** both `AUTHORIZED_EMAIL` and `AUTHORIZED_EMAILS` are set, **When** the app starts, **Then** `AUTHORIZED_EMAILS` takes precedence
3. **Given** a single-user deployment upgrades to `AUTHORIZED_EMAILS`, **When** the existing user signs in, **Then** their existing `User` record, settings, and fasting sessions are all preserved

---

### Edge Cases

- What happens when `AUTHORIZED_EMAILS` contains duplicate email entries? Duplicates are deduplicated — the same email listed twice counts as one entry.
- What happens when `AUTHORIZED_EMAILS` contains emails with mixed casing (e.g., `Alice@Example.com`)? Comparison is case-insensitive to match standard email behavior.
- What happens when `AUTHORIZED_EMAILS` has trailing/leading whitespace around entries? Whitespace is trimmed from each email before comparison.
- What happens when an authorized email is removed from the list? The user cannot sign in again, but their existing data remains in the database (no automatic deletion).
- What happens when a user is signed in and their email is removed from `AUTHORIZED_EMAILS`? The system checks the allowlist on every request (in middleware), so the user loses access immediately on their next page load or API call. No stale JWT grace period.
- What happens when multiple authorized users try to start fasts simultaneously? Each user's fast is independent — no conflicts possible since all data is scoped by `userId`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept a comma-separated list of up to 5 email addresses via the `AUTHORIZED_EMAILS` environment variable
- **FR-002**: System MUST reject sign-in attempts from any email not in the authorized list with the message "This app is private. Access denied."
- **FR-003**: System MUST enforce a maximum of 5 authorized emails — entries beyond the 5th are silently ignored
- **FR-004**: System MUST trim whitespace and perform case-insensitive comparison when validating emails against the authorized list
- **FR-005**: System MUST create a separate `User` record and `UserSettings` record for each authorized user on their first sign-in
- **FR-006**: System MUST scope all fasting session queries, statistics, charts, and settings to the authenticated user's `userId`
- **FR-007**: System MUST fall back to `AUTHORIZED_EMAIL` (singular) if `AUTHORIZED_EMAILS` (plural) is not set, for backward compatibility
- **FR-008**: System MUST preserve all existing user data when migrating from single-user to multi-user configuration
- **FR-009**: System MUST deduplicate email entries in the authorized list
- **FR-010**: System MUST support the development credentials provider for each authorized email — the dev sign-in page shows a dropdown/list of all authorized emails so the developer can pick which user to log in as
- **FR-011**: System MUST validate the authenticated user's email against the `AUTHORIZED_EMAILS` allowlist on every request (in middleware), not only at sign-in — ensuring immediate revocation when an email is removed from the list

### Key Entities

- **Authorized Email List**: The set of up to 5 email addresses permitted to access the app, managed by the owner via environment variable. No database representation — purely configuration.
- **User**: An individual who has signed in at least once. Has a unique email, owns fasting sessions and settings. Already exists in the schema — no changes needed.
- **UserSettings**: Per-user preferences (goal, reminders, theme). One-to-one with User. Already exists in the schema — no changes needed.

## Clarifications

### Session 2026-02-27

- Q: Should the system validate the allowlist only at sign-in, on every request, or on token refresh? → A: Validate on every request (in middleware) — removed users lose access immediately on next page load.
- Q: How should the dev credentials provider support multi-user testing locally? → A: Dev sign-in page shows a dropdown/list of all authorized emails — developer picks which user to log in as.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Up to 5 authorized users can independently sign in and use the app without any cross-user data leakage
- **SC-002**: An unauthorized user (email not in the list) is rejected within 2 seconds of attempting sign-in
- **SC-003**: Existing single-user deployments continue working without any configuration changes or data loss
- **SC-004**: Each user's fasting history, statistics, and settings are 100% isolated — no query returns data belonging to another user
- **SC-005**: The sign-in flow completes in under 3 seconds for authorized users, regardless of how many users are in the list
