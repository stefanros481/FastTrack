# Quickstart: Dashboard — History

**Feature**: 006-dashboard-history
**Date**: 2026-02-26

## Prerequisites

- Node.js 18+
- Bun package manager (`~/.bun/bin/bun`)
- Vercel Postgres database configured (`.env.local` with connection strings)
- Prisma client generated (`bunx prisma generate`)

## Local Development

```bash
# Install dependencies
bun install

# Generate Prisma client (if not already done)
bunx prisma generate

# Start dev server
bun run dev
```

App runs at `http://localhost:3000`.

## What This Feature Changes

### New Files

| File | Purpose |
| ---- | ------- |
| `src/app/api/sessions/route.ts` | Cursor-based paginated API for session history |
| `src/components/HistoryList.tsx` | Paginated history view with infinite scroll |
| `src/components/SessionCard.tsx` | Individual session card component |
| `src/components/SessionCardSkeleton.tsx` | Skeleton loading placeholder |
| `src/components/DeleteConfirmation.tsx` | Delete confirmation prompt |

### Modified Files

| File | Change |
| ---- | ------ |
| `src/components/FastingTimer.tsx` | Replace inline history rendering with `<HistoryList>` |
| `src/components/SessionDetailModal.tsx` | Add delete button and confirmation flow |
| `src/app/actions/fasting.ts` | Add `deleteSession` server action |
| `src/lib/validators.ts` | Add `deleteSessionSchema` |

### No Schema Changes

The `FastingSession` model already has all required fields (`id`, `startedAt`, `endedAt`, `goalMinutes`, `notes`). No Prisma migration needed.

## Testing the Feature

1. **History pagination**: Complete 25+ fasts (or seed the database). Navigate to the Log tab. Verify 20 sessions load initially, and scrolling to the bottom loads more.
2. **Session detail**: Tap any session card. Verify the detail modal shows all fields correctly.
3. **Delete flow**: Open a session detail, tap Delete, confirm. Verify the session is removed from the list.
4. **Empty state**: Delete all sessions. Verify the empty state message appears.
5. **Skeleton loading**: Throttle network in DevTools. Navigate to Log tab. Verify skeleton cards appear during loading.

## Key Decisions

- **API route for pagination** (not server action) — GET semantics per Constitution Principle III
- **IntersectionObserver** for infinite scroll — native API, no additional dependency
- **Hard delete** — no soft delete or undo; permanent removal per spec
- **Cursor = session `id`** — primary key, guaranteed unique, already indexed
