# Feature Specification: Session Notes

**Feature Branch**: `004-session-notes`
**Created**: 2026-02-26
**Status**: Draft
**Input**: User description: "Add optional free-text notes to fasting sessions. Users can add, edit, and clear notes on active fasts and completed sessions. Max 280 characters with character counter."

## Clarifications

### Session 2026-02-26

- Q: How does the user trigger a note save? → A: Auto-save on blur (when user taps outside the input), with a brief "Saved" indicator for feedback.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add a Note to an Active Fast (Priority: P1)

As a user currently fasting, I want to add an optional note to my active fasting session so that I can record how I'm feeling or capture context about this fast in the moment.

**Why this priority**: Adding a note during an active fast is the primary use case — users are most motivated to record context while fasting. This is the core value proposition of the notes feature.

**Independent Test**: Can be fully tested by starting a fast, typing a note in the text input on the active fast screen, saving it, and verifying the note persists when the page is refreshed. Delivers immediate value by capturing in-the-moment context.

**Acceptance Scenarios**:

1. **Given** I have an active fasting session, **When** I view the active fast screen, **Then** I see a text input area for adding a note.
2. **Given** I am on the active fast screen, **When** I type a note and tap outside the input, **Then** the note is auto-saved, a brief "Saved" indicator appears, and the note is visible when I return to the screen.
3. **Given** I am typing a note, **When** I reach 280 characters, **Then** I cannot type any additional characters.
4. **Given** I am typing a note, **When** I view the character counter, **Then** it shows the current character count out of 280.
5. **Given** I am typing a note, **When** the character count approaches the 280-character limit, **Then** the counter changes to a warning color to indicate I'm near the limit.
6. **Given** I have an active fast with no note, **When** I view the active fast screen, **Then** the note input area shows placeholder text inviting me to add a note.

---

### User Story 2 - Edit a Note on a Completed Session (Priority: P2)

As a user reviewing my fasting history, I want to edit or add a note on a completed session so that I can record reflections after the fast ends or correct earlier notes.

**Why this priority**: Editing notes on completed sessions extends the feature beyond active fasts, allowing users to annotate their history. This is the second most valuable flow since many users reflect after a fast ends.

**Independent Test**: Can be fully tested by viewing a completed session's details, tapping the note area to edit, modifying the text, saving, and verifying the change persists. Delivers value by enabling post-fast reflection.

**Acceptance Scenarios**:

1. **Given** I am viewing a completed session's details, **When** the session has no note, **Then** I see an option to add a note.
2. **Given** I am viewing a completed session's details, **When** the session already has a note, **Then** I can tap the note to enter edit mode.
3. **Given** I am editing a note on a completed session, **When** I modify the text and tap outside the input, **Then** the updated note is auto-saved and a brief "Saved" indicator appears.
4. **Given** I am editing a note on a completed session, **When** I clear all text and tap outside the input, **Then** the note is removed from the session.
5. **Given** I am editing a note, **When** the same 280-character limit applies, **Then** the character counter and limit enforcement behave identically to the active fast screen.

---

### User Story 3 - View Note Previews in History (Priority: P3)

As a user browsing my fasting history, I want to see a preview of each session's note in the history list so that I can quickly scan my notes without opening each session.

**Why this priority**: Note previews in the history list improve scanning and discovery but depend on notes already being added (P1/P2). This enhances the browsing experience without being essential to core note functionality.

**Independent Test**: Can be fully tested by adding notes to several sessions, navigating to the history list, and verifying each session card shows a truncated one-line preview of its note. Delivers value by making notes discoverable at a glance.

**Acceptance Scenarios**:

1. **Given** I am viewing the fasting history list, **When** a session has a note, **Then** the session card shows a truncated one-line preview of the note.
2. **Given** I am viewing the fasting history list, **When** a session has no note, **Then** no note preview area is shown on that session card.
3. **Given** a session has a long note, **When** I view it in the history list, **Then** the preview is truncated with an ellipsis to fit one line.

---

### Edge Cases

- What happens when a user pastes text that exceeds 280 characters? The input truncates the pasted text at the 280-character limit.
- What happens when a user types exactly 280 characters? The counter shows 280/280 in the warning color but the note can still be saved.
- What happens if the user navigates away while typing a note before blur triggers? The note may not be saved if the blur event does not fire before navigation; the user is not warned of unsaved changes.
- What happens if the note contains only whitespace? The system treats an all-whitespace note as empty (no note saved).
- What happens if the user tries to add a note to a session that doesn't belong to them? The system rejects the request (enforced by existing session ownership).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an optional free-text note field on each fasting session.
- **FR-002**: System MUST enforce a maximum note length of 280 characters at both the input and data storage levels.
- **FR-003**: System MUST display a visible character counter when the user is typing or editing a note, showing current count relative to the 280-character maximum.
- **FR-004**: System MUST change the character counter to a warning color when the character count approaches or reaches 280.
- **FR-005**: System MUST allow the user to add a note from the active fast screen.
- **FR-006**: System MUST allow the user to add, edit, or clear a note from the session detail view for completed sessions.
- **FR-007**: System MUST auto-save note changes when the user taps outside the input (on blur) and display a brief "Saved" indicator as confirmation.
- **FR-008**: System MUST treat notes containing only whitespace as empty (equivalent to no note).
- **FR-009**: System MUST truncate pasted text that exceeds the 280-character limit.
- **FR-010**: System MUST display a one-line truncated preview of the note on session cards in the history list.
- **FR-011**: System MUST hide the note preview area on session cards that have no note.

### Key Entities

- **Note**: A free-text annotation attached to a fasting session. Maximum 280 characters. Optional — a session may have zero or one note. Stored as part of the session record (not a separate entity).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add a note to an active fasting session in under 10 seconds (from tapping the input to saving).
- **SC-002**: Users can edit or clear a note on a completed session in under 15 seconds.
- **SC-003**: The character counter accurately reflects the current character count at all times during typing.
- **SC-004**: 100% of notes exceeding 280 characters are prevented from being saved.
- **SC-005**: Note previews in the history list are visible and legible on mobile screens without requiring users to open the session detail.

## Assumptions

- Notes are plain text only — no rich text formatting, links, or media attachments.
- A session can have at most one note (not multiple notes or a thread of notes).
- Notes do not support undo/redo beyond standard browser text input behavior.
- Notes auto-save on blur (when the user taps outside the input). A brief "Saved" indicator confirms the save. No separate save button is needed.
- The 280-character limit is enforced on the count of characters, not bytes.
- The "approaching limit" warning threshold for the character counter is at 260 characters (20 characters remaining).

## Scope Boundaries

### In Scope
- Adding notes to active fasting sessions
- Adding, editing, and clearing notes on completed sessions
- Character counter with limit enforcement
- Note preview in history list

### Out of Scope
- Rich text formatting or markdown support
- Searching or filtering sessions by note content
- Note templates or pre-defined tags
- Note history or version tracking
- Exporting notes
