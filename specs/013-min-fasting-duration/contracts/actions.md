# Server Action Contracts: Minimum Fasting Duration

**Feature Branch**: `013-min-fasting-duration`
**Date**: 2026-03-03

## Modified: `stopFast(sessionId: string)`

**File**: `src/app/actions/fasting.ts`

**Current behavior**: Sets `endedAt = new Date()` on the session.

**New behavior**: Before setting `endedAt`, checks if `now - startedAt >= 12 hours`. If not, returns an error instead of saving.

```typescript
// New validation added before the update:
// 1. Fetch the session to get startedAt
// 2. Check: new Date() - session.startedAt >= 720 * 60 * 1000 (12h in ms)
// 3. If under 12h: return error (do not set endedAt)
// 4. If 12h or more: proceed as before
```

**Input**: `sessionId: string`

**Current return type**: `FastingSession | null`

**New return type** (discriminated union matching `DeleteSessionResult` pattern):

```typescript
export type StopFastResult =
  | { success: true; session: FastingSession }
  | { success: false; error: string };
```

**Output cases**:
- Success (>= 12h): `{ success: true, session: <updated FastingSession> }`
- Error (< 12h): `{ success: false, error: "Session must be at least 12 hours" }`
- Already ended (P2025): `{ success: true, session: null }` — treated as success so client can clear state

**Breaking change**: Callers must switch from checking `result` directly to checking `result.success`. Both `FastingTimer.tsx` (T007) and the accessible fallback `handleEndSessionAccessible` must be updated.

## Unchanged: `deleteSession(sessionId: string)`

**File**: `src/app/actions/fasting.ts`

No modifications needed. Already performs a hard-delete scoped by userId. Used as-is for the cancel path (sub-12h sessions).

**Input**: `{ sessionId: string }`
**Output**: `{ success: true } | { success: false, error: string }`

## Modified: `sessionEditSchema` (Zod)

**File**: `src/lib/validators.ts`

**New refinement added**:

```typescript
.refine(
  (data) => data.endedAt.getTime() - data.startedAt.getTime() >= 720 * 60 * 1000,
  {
    message: "Session must be at least 12 hours",
    path: ["endedAt"],
  }
)
```

**Effect**: Automatically enforced in:
1. `SessionDetailModal.tsx` — client-side real-time validation (via `useEffect`)
2. `updateSession()` server action — server-side validation (via `safeParse`)

## New: `ProgressRing` prop

**File**: `src/components/ProgressRing.tsx`

**New prop**: `isBelowMinimum: boolean`

When `true`:
- Hint text: "Hold ring to cancel" (instead of "Hold ring to end")
- Active press text: "Hold to cancel..." (instead of "Hold to end...")
- Completion text: "Session cancelled" (instead of "Session ended")

When `false`:
- All existing text unchanged
