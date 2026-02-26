# Data Model: Session Editing

**Feature**: 003-session-editing
**Date**: 2026-02-26

## Existing Entities (no schema changes required)

### FastingSession

The existing `FastingSession` model already contains all fields needed for session editing. No migration is required.

| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | Foreign key to User |
| startedAt | DateTime | When the fast started |
| endedAt | DateTime? | When the fast ended (null = active) |
| goalMinutes | Int? | Target duration in minutes |
| notes | String? | User notes |
| createdAt | DateTime | Record creation timestamp |
| updatedAt | DateTime | Last update timestamp (auto-managed by Prisma) |

### Constraints

- **Time ordering**: `startedAt < endedAt` (enforced by application logic, not DB constraint)
- **No overlap**: For a given `userId`, no two sessions may have overlapping `[startedAt, endedAt]` ranges (enforced by application logic)
- **No future times**: Neither `startedAt` nor `endedAt` may exceed the current time at the moment of save (enforced by application logic)

### Overlap Detection Query

To check if a proposed `[newStart, newEnd]` range overlaps any existing session for the user (excluding the session being edited):

```
WHERE userId = :userId
  AND id != :sessionId
  AND startedAt < :newEnd
  AND endedAt > :newStart
```

If any rows are returned, the edit is rejected with an overlap error.

## Validation Schema (Zod)

Shared between client and server:

```
SessionEditSchema {
  sessionId: string (cuid format)
  startedAt: Date (must be in the past)
  endedAt: Date (must be in the past, must be after startedAt)
}
```

Refinements:
- `startedAt < endedAt` → error: "Start time must be before end time"
- `startedAt <= now()` → error: "Start time cannot be in the future"
- `endedAt <= now()` → error: "End time cannot be in the future"

## State Transitions

No new states introduced. The only relevant state boundary:
- Only sessions with `endedAt != null` (completed) are editable
- Active sessions (`endedAt == null`) are not shown in the edit flow
