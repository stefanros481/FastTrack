# Data Model: Minimum Fasting Duration Enforcement

**Feature Branch**: `013-min-fasting-duration`
**Date**: 2026-03-03

## Schema Changes

**None required.** This feature is implemented entirely as business logic — no database schema modifications.

## Existing Entity: FastingSession

```prisma
model FastingSession {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  startedAt   DateTime
  endedAt     DateTime?  // null = active session
  goalMinutes Int?
  notes       String?   @db.VarChar(280)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

## Business Rules (enforced in application code)

| Rule | Enforcement Point | Description |
|------|------------------|-------------|
| Minimum 12h for completed sessions | `stopFast()` server action | Server rejects `stopFast()` if `now - startedAt < 12h` |
| Minimum 12h for session edits | `sessionEditSchema` (Zod) | New `.refine()` checks `endedAt - startedAt >= 12h` |
| Cancel (hard-delete) for sub-12h | `deleteSession()` server action | Existing action, called by client when elapsed < 12h |

## State Transitions

```
[No Session] → startFast() → [Active: endedAt = null]
                                    │
                    ┌───────────────┤
                    │               │
              elapsed < 12h    elapsed >= 12h
                    │               │
            deleteSession()    stopFast()
                    │               │
                    ▼               ▼
             [No Session]     [Completed: endedAt set]
              (hard-deleted)   (saved to history)
```

## Validation Constants

| Constant | Value | Usage |
|----------|-------|-------|
| `MIN_FAST_MINUTES` | 720 | 12 hours × 60 minutes (Zod schema, client-side: `MIN_FAST_MINUTES * 60`) |
| `MIN_FAST_MS` | 43200000 | 12 hours in milliseconds (server-side `stopFast()` guard) |
