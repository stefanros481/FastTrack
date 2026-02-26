# Data Model: Dashboard — History

**Feature**: 006-dashboard-history
**Date**: 2026-02-26

## Entities

### FastingSession (existing — no schema changes)

| Field | Type | Nullable | Description |
| ----- | ---- | -------- | ----------- |
| id | String (cuid) | No | Primary key, used as pagination cursor |
| userId | String | No | Foreign key to User; all queries scoped to this |
| startedAt | DateTime | No | When the fast began |
| endedAt | DateTime | Yes | When the fast ended; `null` = active fast |
| goalMinutes | Int | Yes | Target duration in minutes; `null` = no goal |
| notes | String (VarChar 280) | Yes | User-entered note |
| createdAt | DateTime | No | Auto-set on creation |
| updatedAt | DateTime | No | Auto-updated on modification |

**History filter**: Only sessions where `endedAt IS NOT NULL` appear in history.

**Cursor pagination**: Uses `id` as cursor (primary key, indexed, unique). Ordered by `startedAt DESC`.

**No schema migration required** — all fields already exist.

### Derived/Computed Fields (client-side)

These are computed in the UI from the persisted fields above:

| Field | Derivation | Description |
| ----- | ---------- | ----------- |
| durationHours | `(endedAt - startedAt) / 3600000` | Session duration in hours |
| goalMet | `goalMinutes != null && durationHours >= goalMinutes / 60` | Whether the user reached their goal |

## State Transitions

```
Session lifecycle (relevant to history):

  [Active Fast] --stopFast()--> [Completed] --deleteSession()--> [Deleted/Gone]
       │                             │
  endedAt = null              endedAt != null
  (excluded from history)     (shown in history)
```

- Only completed sessions (`endedAt IS NOT NULL`) appear in the history list.
- Deletion is permanent (hard delete). No soft-delete or trash state.

## Validation Rules

### deleteSession

| Rule | Enforcement |
| ---- | ----------- |
| `sessionId` must be a valid non-empty string | Zod schema (client + server) |
| Session must belong to the authenticated user | Server-side `where: { id, userId }` query |
| Session must exist | Server-side: if not found, return error |

## Indexes

The `id` field is already the primary key (indexed by default). For optimal cursor pagination performance on the history query (`WHERE userId = ? AND endedAt IS NOT NULL ORDER BY startedAt DESC`), a composite index on `(userId, startedAt)` would be beneficial but is not strictly required at current scale (single user, hundreds of sessions). This can be added later if query performance degrades.
