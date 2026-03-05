# Quickstart: Database Connection Status Indicator

**Branch**: `015-connection-status` | **Date**: 2026-03-05

## What This Feature Does

Adds a small status indicator in the app header that shows whether the backend/database is ready. This prevents users from trying to start a fast while the database is still waking up (Neon free tier sleeps after inactivity).

## Files to Create

1. **`src/app/api/health/route.ts`** — Health check API endpoint
   - GET handler that runs `SELECT 1` via Prisma
   - Returns `{ status: "ok" }` (200) or `{ status: "error" }` (503)
   - Requires auth session

2. **`src/hooks/useConnectionStatus.ts`** — Polling hook
   - Returns `status: "connecting" | "online" | "offline"`
   - Fetches `/api/health` on mount
   - Retries every 5s on failure, stops on success

3. **`src/components/ConnectionStatus.tsx`** — Status indicator UI
   - Pill badge with colored dot + label text
   - Three visual states: yellow/Connecting, green/Online, red/Offline
   - Auto-hides after 3s when online (fade-out animation)
   - Pulse animation on yellow dot (`motion-safe:animate-pulse`)

## Files to Modify

4. **`src/components/FastingTimer.tsx`**
   - Import and render `<ConnectionStatus />` in header (before ThemeToggle)
   - Use connection status to disable "Start Fast" button when not online

## Implementation Order

1. Create health check endpoint (standalone, testable immediately)
2. Create `useConnectionStatus` hook (can test with browser console)
3. Create `ConnectionStatus` component (visual, can render in isolation)
4. Integrate into `FastingTimer` (wire everything together)

## Testing

- Open app after 5+ minutes of DB inactivity → should see "Connecting..." then "Online"
- Block network in DevTools → should see "Offline", re-enable → "Online"
- While "Connecting" or "Offline", "Start Fast" button should be disabled
- "Online" indicator should fade away after ~3 seconds
