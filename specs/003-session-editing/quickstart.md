# Quickstart: Session Editing

**Feature**: 003-session-editing
**Branch**: `003-session-editing`

## Prerequisites

- Node.js 18+, Bun installed
- `.env.local` configured with database URL and auth secrets
- Database tables created (`bunx prisma db push`)

## Development

```bash
# Switch to feature branch
git checkout 003-session-editing

# Install dependencies
bun install

# Start dev server
bun run dev
```

## What This Feature Adds

1. **Session Detail Modal** (`src/components/SessionDetailModal.tsx`)
   - Opens when tapping a completed session in the Log tab
   - Shows start time, end time, duration, protocol, goal status
   - Editable start/end time fields using native datetime-local inputs
   - Inline validation errors for invalid times
   - Save button (disabled when errors present)

2. **Update Session Server Action** (`src/app/actions/fasting.ts`)
   - New `updateSession(sessionId, startedAt, endedAt)` action
   - Validates with Zod schema, checks overlap, updates database

3. **Shared Validation** (`src/lib/validators.ts`)
   - `sessionEditSchema` — Zod schema for time editing validation
   - Used by both the modal (client-side) and server action (server-side)

## Files Changed

| File | Change |
|------|--------|
| `src/lib/validators.ts` | NEW — Zod validation schemas |
| `src/components/SessionDetailModal.tsx` | NEW — Detail/edit modal component |
| `src/components/FastingTimer.tsx` | MODIFIED — Add tap handler on history items, render modal |
| `src/app/actions/fasting.ts` | MODIFIED — Add `updateSession` server action |

## Testing

1. Start a fast, end it, go to Log tab
2. Tap a completed session → modal opens
3. Edit start time → duration recalculates live
4. Set start after end → "Start time must be before end time" error, Save disabled
5. Set time in the future → "cannot be in the future" error
6. Save valid edit → modal closes, history list updates
7. Dismiss without saving → original data preserved
