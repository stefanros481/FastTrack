# Quickstart: ShadCN 24-Hour Date & Time Picker

**Feature**: 001-shadcn-datetime-picker
**Branch**: `001-shadcn-datetime-picker`

## Prerequisites

- Node.js / Bun installed
- `.env.local` configured (existing — no new env vars needed)
- Dev server stopped (or let it hot-reload)

## Implementation Steps

### Step 1 — Add ScrollArea component

```bash
bunx shadcn add scroll-area
```

This adds `src/components/ui/scroll-area.tsx`. No new npm packages are installed (uses the existing `radix-ui` dependency).

### Step 2 — Rewrite DateTimePicker

Replace the contents of `src/components/ui/date-time-picker.tsx` with the new ShadCN 24h implementation (see tasks.md for the exact code). The component interface (`value`, `onChange`, `error`, `id`) is **unchanged** — no other files need updating.

### Step 3 — Verify

1. Start dev server: `bun run dev`
2. Open the app at `http://localhost:3000`
3. Navigate to the history/log view
4. Tap a past session to open the Session Details modal
5. Tap the **Start Time** field — a popover should open with:
   - A calendar on the left
   - Scrollable hour column (0–23) on the right
   - Scrollable minute column (00, 05, 10, …, 55) on the right
   - Current hour and minute pre-highlighted and scrolled into view
6. Tap a date, an hour, and a minute — trigger button should show "Feb 25, 2026 18:00" style format
7. Tap the **End Time** field — same behavior
8. Save — session should update correctly with no validation regressions

## Key File

| File | Role |
|------|------|
| `src/components/ui/date-time-picker.tsx` | The only file changed |
| `src/components/ui/scroll-area.tsx` | New — added by shadcn CLI |

## No-Op Files (do not change)

- `src/components/SessionDetailModal.tsx`
- `src/lib/validators.ts`
- `src/app/actions/fasting.ts`
- `prisma/schema.prisma`
