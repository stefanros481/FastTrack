# Quickstart: Minimum Fasting Duration Enforcement

**Feature Branch**: `013-min-fasting-duration`
**Date**: 2026-03-03

## Prerequisites

- Node.js 18+
- Bun package manager
- `.env.local` with `DATABASE_URL_UNPOOLED` and auth credentials
- Prisma client generated (`bunx prisma generate`)

## Setup

```bash
git checkout 013-min-fasting-duration
bun install
bunx prisma generate
bun dev
```

No database migrations needed — this feature has no schema changes.

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/validators.ts` | Add min 12h `.refine()` to `sessionEditSchema` |
| `src/app/actions/fasting.ts` | Add 12h guard to `stopFast()`; update return type |
| `src/components/FastingTimer.tsx` | Conditional `deleteSession()` vs `stopFast()` based on elapsed time |
| `src/components/ProgressRing.tsx` | New `isBelowMinimum` prop; conditional label text |

## Testing

1. **Cancel path (< 12h)**: Start a fast → immediately long-press → verify ring says "Cancel" → verify session is deleted (not in history)
2. **End path (>= 12h)**: Start a fast → edit start time to 13h ago → long-press → verify ring says "End" → verify session saved to history
3. **Edit validation**: Open a completed session → change end time to create < 12h duration → verify error message appears and save is disabled
4. **Server guard**: Verify `stopFast()` rejects sub-12h sessions even if called directly
5. **Live transition**: Start a fast → edit start time to ~11h 59m ago → watch ring label transition from "Cancel" to "End" at the 12h mark

## Key Constants

```typescript
// Defined in src/lib/validators.ts
export const MIN_FAST_MINUTES = 720;      // 12 hours (used in Zod schema)
export const MIN_FAST_MS = 43200000;      // 12 hours in ms (used in server guard)
// Client-side: compare elapsedSeconds < MIN_FAST_MINUTES * 60 (43200)
```
