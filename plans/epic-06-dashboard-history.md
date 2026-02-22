# Epic 6: Dashboard — History

Paginated, chronological list of completed sessions. Each entry is tappable, opening the session detail / edit modal.

**API:** `GET /api/sessions` — cursor-based pagination, 20 per page, scoped to authenticated user.

---

## US-6.1 — View fasting history

*As a user, I want to see a list of all my past fasting sessions so that I can review my habits.*

**Acceptance criteria:**
- Chronological list, newest first
- Each entry shows: date, start → end times, duration, goal (if set), note preview, goal met indicator
- Paginated (20 per page) via API route with cursor-based pagination
- Tap entry to open session detail modal

**Design:**
- SessionCard: `bg-[--color-card]`, `rounded-2xl`, `p-4`, `min-h-11` tappable row; stagger entrance with `motion-safe:animate-slide-up`
- Date label: Heading level — `text-xl font-semibold text-[--color-text]`
- Time range (start → end) and duration: Body level — `text-base text-[--color-text]`
- Note preview: Muted level — `text-sm text-[--color-text-muted]`, `truncate`
- Goal met badge: `rounded-full`, `bg-[--color-success]` tint with `color-mix(in srgb, var(--color-success) 15%, transparent)`, `text-[--color-success]`; goal missed: `text-[--color-text-muted]`
- Loading skeleton: shimmer cards matching SessionCard dimensions (see SkeletonCard pattern from design tokens)
- Gap between cards: `gap-3` (12px)

---

## US-6.2 — Delete a session

*As a user, I want to delete a fasting session that was logged by mistake.*

**Acceptance criteria:**
- Delete button in session detail modal
- Confirmation prompt: "Delete this session? This cannot be undone."
- `deleteSession(sessionId)` server action removes the record and revalidates dashboard data
- All stats and charts update to reflect the deletion

**Design:**
- Delete button: `text-[--color-error]`, body text level, `min-h-11`; placed at bottom of session detail modal
- Confirmation prompt: modal overlay, `bg-[--color-card]`, `rounded-2xl`, `p-4`
- Confirm action button: `bg-[--color-error]`, `rounded-full`, `min-h-11`
- Cancel: `text-[--color-text-muted]`, `min-h-11`

---

**Key files:** `src/app/dashboard/page.tsx`, `src/app/api/sessions/route.ts`, `src/components/SessionCard.tsx`, `src/components/SessionDetail.tsx`, `src/actions/fasting.ts` (`deleteSession`)
