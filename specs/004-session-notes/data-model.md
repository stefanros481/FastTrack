# Data Model: Session Notes

**Feature**: 004-session-notes
**Date**: 2026-02-26

## Entity Changes

### FastingSession (existing model — modified)

The `notes` field already exists. This feature adds a database-level constraint.

| Field | Type | Change | Constraint | Notes |
|-------|------|--------|------------|-------|
| notes | String? | MODIFY | `@db.VarChar(280)` | Add varchar(280) constraint to enforce 280-char limit at DB level |

**Migration required**: `ALTER TABLE "FastingSession" ALTER COLUMN "notes" TYPE VARCHAR(280);`

### No new entities

The note is stored as a field on `FastingSession`, not as a separate entity. A session has zero or one note (nullable field).

## Validation Rules

### noteSchema (new Zod schema)

```
noteSchema = z.object({
  sessionId: z.string().min(1),
  note: z.string().max(280).nullable()
})
```

**Server-side behavior**:
- If `note` is a non-empty string after trimming: store the trimmed value
- If `note` is null, empty string, or whitespace-only after trimming: store `null`

### Client-side behavior

- `maxLength={280}` on textarea element (hard limit)
- Paste handler truncates at 280 characters
- Character counter displays `{count}/280`
- Warning color at count >= 260

## Data Flow

```
User types in NoteInput
  → onChange updates local state (controlled textarea)
  → Character counter re-renders with new count

User blurs textarea (taps outside)
  → Client: trim note, check if changed from initial value
  → If unchanged: no-op
  → If changed: call updateNote server action
    → Server: auth() check
    → Server: Zod validation (noteSchema)
    → Server: Prisma update (scope to userId)
    → Server: return success/error
  → Client: show "Saved" indicator for 1.5s on success
  → Client: show error message on failure
```

## Interfaces Affected

### Server Action: updateNote (new)

```
Input:  { sessionId: string, note: string | null }
Output: { success: true } | { success: false, error: string }
```

### Server Action: getActiveFast (existing — modify return type)

Currently returns session without `notes`. Must include `notes: string | null` in return.

### Server Action: getHistory (existing — modify return type)

Currently returns sessions without `notes`. Must include `notes: string | null` in return.

### Page data mapping (existing — modify)

`src/app/page.tsx` must pass `notes` field through to `FastingTimer` component.

### Component interfaces

**FastingTimer props** — add `notes: string | null` to session objects in `history` and `activeFast` props.

**SessionDetailModal props** — add `notes: string | null` to `SessionData` interface.

**NoteInput props (new)**:
```
{
  sessionId: string
  initialNote: string | null
  onSaved?: () => void
}
```
