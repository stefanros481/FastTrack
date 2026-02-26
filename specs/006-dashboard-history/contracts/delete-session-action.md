# Server Action Contract: deleteSession

**Feature**: 006-dashboard-history
**Date**: 2026-02-26

## Signature

```typescript
deleteSession(sessionId: string): Promise<DeleteSessionResult>
```

## Input

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| sessionId | string | Yes | The unique identifier of the session to delete |

## Validation

1. **Zod schema**: `sessionId` must be a non-empty string
2. **Authentication**: Caller must be authenticated via `auth()`
3. **Ownership**: Session must belong to the authenticated user (`where: { id: sessionId, userId }`)
4. **Existence**: Session must exist; return error if not found

## Output

```typescript
type DeleteSessionResult =
  | { success: true }
  | { success: false; error: string }
```

### Success

```json
{ "success": true }
```

Session is permanently removed. `revalidatePath("/")` is called to refresh all data views.

### Error Cases

| Condition | Response |
| --------- | -------- |
| Not authenticated | `{ success: false, error: "Unauthorized" }` |
| Session not found or not owned by user | `{ success: false, error: "Session not found" }` |
| Unexpected error | `{ success: false, error: "Failed to delete session" }` |

## Side Effects

- Permanently deletes the `FastingSession` record from the database
- Calls `revalidatePath("/")` to invalidate cached page data (stats, history)
