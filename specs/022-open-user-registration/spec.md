# Feature Specification: Open User Registration

**Feature Branch**: `022-open-user-registration`
**Created**: 2026-03-11
**Status**: Draft
**Input**: User description: "Before we deploy to Google App Store, we need to enable the app to add users without having to add them to an environment variable. We should take advantage of Google OAuth and store user authorization in the database."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Self-Service Sign-Up via Google (Priority: P1)

As a new user, I want to sign up for FastTrack using my Google account without needing the app owner to manually add my email to an environment variable, so that I can start using the app immediately.

**Why this priority**: This is the core problem being solved. The current system requires the app owner to redeploy with updated environment variables for every new user. This blocks app store deployment where users self-register.

**Independent Test**: Can be fully tested by having a new Google account (not previously in the system) sign in and verify they gain access to the app with a fresh profile and default settings.

**Acceptance Scenarios**:

1. **Given** a person with a Google account visits the app for the first time, **When** they click "Sign in with Google" and complete the OAuth flow, **Then** a new account is created for them and they land on the main fasting screen with default settings.
2. **Given** a person signs up via Google OAuth, **When** their account is created, **Then** their Google profile information (name, email, profile photo) is stored and displayed in the app.
3. **Given** a returning user, **When** they sign in with the same Google account, **Then** they see their existing data (fasting history, settings, achievements) without any duplicate account being created.
4. **Given** the `AUTHORIZED_EMAILS` environment variable is not set, **When** any Google user signs in, **Then** registration succeeds (the env var is no longer required for the app to function).

---

### User Story 2 - Admin User Management (Priority: P1)

As the app owner (admin), I want to manage users — view who has signed up, and deactivate or remove accounts — so that I retain control over who can use the app.

**Why this priority**: Moving from a closed allowlist to open registration means the owner needs an alternative way to control access. Without this, the app is fully open with no moderation capability.

**Independent Test**: Can be tested by signing in as the admin, navigating to user management, and verifying that user listing, deactivation, and reactivation all work correctly.

**Acceptance Scenarios**:

1. **Given** the admin is signed in, **When** they navigate to user management, **Then** they see a list of all registered users with their name, email, profile photo, sign-up date, and active/inactive status.
2. **Given** the admin views the user list, **When** they deactivate a user, **Then** that user is immediately prevented from accessing the app on their next request, and they see a message explaining their account is inactive.
3. **Given** a user has been deactivated, **When** the admin reactivates them, **Then** the user can sign in and access the app again with all their previous data intact.
4. **Given** the admin is viewing user management, **When** they check their own account, **Then** they cannot deactivate themselves (self-deactivation prevention).

---

### User Story 3 - First User Becomes Admin (Priority: P1)

As the app owner deploying FastTrack for the first time, I want the first person to sign up to automatically become the admin, so that there is no chicken-and-egg problem where an admin must exist to create the admin.

**Why this priority**: Without automatic admin bootstrapping, there is no way to designate the first admin without falling back to environment variables or database manipulation — defeating the purpose of this feature.

**Independent Test**: Can be tested by deploying a fresh instance, signing in with the first Google account, and verifying that account receives admin privileges automatically.

**Acceptance Scenarios**:

1. **Given** the app has zero registered users, **When** the first person signs in via Google OAuth, **Then** their account is created with admin role automatically.
2. **Given** the app already has one or more users, **When** a new person signs in, **Then** their account is created with a regular (non-admin) role.
3. **Given** the admin wants to promote another user, **When** they assign admin role to that user, **Then** both users have admin privileges.

---

### User Story 4 - Backward Compatibility with Existing Deployment (Priority: P2)

As the app owner with an existing deployment, I want my current users and data to remain intact when this feature is deployed, and I want the option to keep the allowlist temporarily if desired.

**Why this priority**: Existing deployments must not break. The migration path from env-based allowlist to database-driven registration must be smooth.

**Independent Test**: Can be tested by deploying the update to an existing instance and verifying all existing users retain access and data, and the first existing user (or the user matching `AUTHORIZED_EMAILS`) becomes admin.

**Acceptance Scenarios**:

1. **Given** an existing deployment with users in the database, **When** this feature is deployed, **Then** all existing users retain their accounts, data, and access.
2. **Given** `AUTHORIZED_EMAILS` is still set in the environment, **When** the feature is deployed, **Then** existing users matching those emails are preserved with their data, the first email in the list becomes admin if no admin exists yet, and the env var is then fully ignored going forward.
3. **Given** the migration has completed, **When** a new user signs in, **Then** they are registered through the new database-driven system. The `AUTHORIZED_EMAILS` env var is fully deprecated and has no effect.

---

### Edge Cases

- What happens if the admin deletes their own account? The system must prevent self-deactivation and self-demotion for the last remaining admin.
- What happens if all admins are somehow removed? The system must ensure at least one admin exists at all times. If only one admin remains, they cannot be deactivated or demoted.
- What if a deactivated user tries to sign in? They should see a clear message that their account is inactive, not a generic error.
- What about the 5-user cap from the current `AUTHORIZED_EMAILS` system? The hard-coded 5-user cap is replaced with a configurable maximum (default 200) via the `MAX_USERS` environment variable.
- What if Google OAuth returns different profile data (name/photo change) for a returning user? The profile information should be updated on each sign-in while preserving the account identity (matched by email).
- What about abuse or spam sign-ups? The admin can deactivate unwanted accounts. Rate limiting on sign-up is a reasonable default (handled at the infrastructure level).
- What happens when the maximum user cap is reached? New users attempting to sign in see a clear "registration is currently closed" message. Existing users are unaffected. The admin can increase the cap by updating the environment variable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow any user with a Google account to create an account by completing the Google OAuth sign-in flow.
- **FR-002**: System MUST automatically create a user record with default settings upon first sign-in.
- **FR-003**: System MUST assign a role to each user — either "admin" or "user".
- **FR-004**: System MUST automatically assign the admin role to the first user who signs up on a fresh deployment.
- **FR-005**: System MUST provide an admin-only user management screen where admins can view all users, deactivate users, reactivate users, and promote users to admin.
- **FR-006**: System MUST prevent deactivated users from accessing any app functionality on their very next request (per-request active status check), showing them a clear "account inactive" message.
- **FR-007**: System MUST prevent the last remaining admin from being deactivated or demoted.
- **FR-008**: System MUST preserve all existing user data and access during migration from the env-based allowlist system.
- **FR-009**: System MUST no longer require the `AUTHORIZED_EMAILS` environment variable to function — it becomes optional.
- **FR-010**: System MUST replace the hard-coded 5-user limit with a configurable maximum user cap (default: 200), controlled via an environment variable. When the cap is reached, new sign-ups are rejected with a clear "registration is currently closed" message.
- **FR-010a**: Admins MUST be able to see the current user count relative to the cap in the user management screen.
- **FR-011**: System MUST update returning users' profile information (name, photo) from Google OAuth on each sign-in without creating duplicate accounts.
- **FR-012**: Admins MUST be able to access user management from the settings or navigation area.

### Key Entities

- **User**: Extended with role (admin/user) and active status (active/inactive). Email remains the unique identifier. Existing fields (name, image, settings, fasting sessions) are unchanged.
- **Role**: Defines what a user can do — "admin" has full access including user management; "user" has standard app access.
- **Active Status**: Controls whether a user can access the app — inactive users are blocked at sign-in.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can sign up and start using the app within 30 seconds of clicking "Sign in with Google" — no manual intervention by the app owner required.
- **SC-002**: 100% of existing users retain full access and data after migration with zero downtime.
- **SC-003**: The admin can deactivate a user and the effect takes hold immediately on the user's very next request.
- **SC-004**: The app functions correctly with zero environment-variable-based email configuration.
- **SC-005**: The first user on a fresh deployment automatically becomes admin without any manual database manipulation.
- **SC-006**: The system supports at least 100 registered users without performance degradation.

## Clarifications

### Session 2026-03-11

- Q: Should registration be fully open, approval-based, or toggleable? → A: Fully open, but with a configurable maximum user cap (default 200, set via environment variable). Once the cap is reached, new sign-ups are rejected with a clear message.
- Q: When an admin deactivates a user, when does it take effect? → A: Per-request check — every request validates the user's active status, so deactivation takes effect immediately on the next request.
- Q: Can admins permanently delete user accounts? → A: Deactivate only for now. Data is preserved, no permanent deletion. Permanent deletion can be added as a future feature.

## Assumptions

- Google OAuth remains the sole authentication provider (no email/password, no additional OAuth providers needed for this feature).
- The admin UI for user management will be a simple list view within the existing settings area — not a full-featured admin dashboard.
- Deactivated users' data is preserved (not deleted) — they can be reactivated by an admin.
- There is no self-service account deletion (only admin can manage accounts). Self-service account deletion may be a future feature.
- The dev-credentials provider (development only) will continue to work for local development, also using the new database-driven role system.
- No email notifications are sent when users are activated/deactivated — this is a manual admin process for now.

## Scope Boundaries

### In Scope
- Open registration via Google OAuth (remove env-var allowlist requirement)
- User role system (admin/user) with first-user auto-admin
- Active/inactive status per user
- Admin user management screen (list, deactivate, reactivate, promote)
- Migration path for existing deployments
- Backward compatibility for `AUTHORIZED_EMAILS` during transition

### Out of Scope
- Additional OAuth providers (GitHub, Apple, etc.)
- Self-service account deletion
- User invitation system (invite links, email invites)
- Granular permissions beyond admin/user roles
- User profile editing (name, photo — these come from Google)
- Email notifications for account status changes
- Rate limiting or CAPTCHA for sign-up abuse prevention
