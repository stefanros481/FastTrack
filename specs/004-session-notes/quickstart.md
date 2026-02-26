# Quickstart: Session Notes

**Feature**: 004-session-notes
**Date**: 2026-02-26

## Prerequisites

- Node.js 18+
- Bun package manager
- `.env.local` with database credentials configured
- Prisma client generated (`bunx prisma generate`)

## Setup after checkout

```bash
git checkout 004-session-notes
bun install
bunx prisma migrate dev       # Apply the VarChar(280) migration
bun run dev                    # Start dev server
```

## Key files to modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `@db.VarChar(280)` to `notes` field |
| `src/lib/validators.ts` | Add `noteSchema` Zod validator |
| `src/app/actions/fasting.ts` | Add `updateNote` action; include `notes` in `getActiveFast` and `getHistory` returns |
| `src/components/NoteInput.tsx` | **NEW** — Reusable textarea with character counter and blur-save |
| `src/components/FastingTimer.tsx` | Add `NoteInput` to active fast view; add note preview to history cards; pass `notes` through interfaces |
| `src/components/SessionDetailModal.tsx` | Add `NoteInput` for editing notes on completed sessions |
| `src/app/page.tsx` | Pass `notes` field through data mapping to `FastingTimer` |

## Verification checklist

1. Start a fast → note input visible on active fast screen
2. Type a note → character counter shows count/280
3. Type 260+ chars → counter turns red
4. Tap outside textarea → "Saved" indicator appears, note persists on refresh
5. Open a completed session → tap note area to edit
6. Clear note text, tap outside → note removed
7. Check history list → note preview shows truncated on session cards
8. Session without note → no note preview area visible
