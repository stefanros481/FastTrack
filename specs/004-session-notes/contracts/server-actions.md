# Server Action Contracts: Session Notes

**Feature**: 004-session-notes
**Date**: 2026-02-26

## updateNote (new)

**File**: `src/app/actions/fasting.ts`
**Purpose**: Create, update, or clear a note on a fasting session.

### Input

| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| sessionId | string | Yes | Non-empty string, must belong to authenticated user |
| note | string \| null | Yes | Max 280 characters after trim; null or whitespace-only clears the note |

### Behavior

1. Authenticate via `auth()` — reject if no session
2. Validate input with `noteSchema` (Zod)
3. Trim the note; if empty after trim, set to `null`
4. Find session by `id` AND `userId` (ownership check)
5. Update session's `notes` field
6. Return result

### Output

**Success**: `{ success: true }`
**Failure**: `{ success: false, error: string }`

### Error cases

| Condition | Error message |
|-----------|---------------|
| Not authenticated | "Not authenticated" |
| Session not found or not owned by user | "Session not found" |
| Note exceeds 280 characters | "Note must be 280 characters or less" |

---

## getActiveFast (existing — modified return)

**Change**: Include `notes` field in returned session object.

**Before**: `{ id, startedAt, goalMinutes }`
**After**: `{ id, startedAt, goalMinutes, notes }`

---

## getHistory (existing — modified return)

**Change**: Include `notes` field in returned session objects.

**Before**: `{ id, startedAt, endedAt, goalMinutes }[]`
**After**: `{ id, startedAt, endedAt, goalMinutes, notes }[]`
