# Epic 3: Session Editing

Users can correct start/end times after the fact via the session detail modal. Validation runs both client-side (immediate feedback) and server-side (security).

---

## US-3.1 — Edit start time

*As a user, I want to edit the start time of a session so that I can correct it if I forgot to tap "Start" on time.*

**Acceptance criteria:**
- From session detail modal, I can tap the start time to open a date/time picker
- The picker defaults to the current `startedAt` value
- Server action validates and updates the session, recalculates duration
- Validation prevents `startedAt >= endedAt`
- Validation prevents overlap with adjacent sessions

**Design:**
- Tappable time field: body text level (`text-base`), `rounded-xl`, `min-h-11` touch target, `bg-[--color-background]` inset background
- Date/time picker: native input styled to match — `rounded-xl`, `bg-[--color-card]`

---

## US-3.2 — Edit end time

*As a user, I want to edit the end time of a session so that I can correct it if I forgot to tap "Stop" on time.*

**Acceptance criteria:**
- From session detail modal, I can tap the end time to open a date/time picker
- The picker defaults to the current `endedAt` value
- Validation prevents `endedAt <= startedAt`
- Validation prevents overlap with adjacent sessions

**Design:** Same as US-3.1 — consistent date/time picker treatment.

---

## US-3.3 — Validation feedback on edit

*As a user, I want to see clear feedback if my edited times are invalid so that I don't save bad data.*

**Acceptance criteria:**
- If `startedAt >= endedAt`, show inline error: "Start time must be before end time"
- If the session overlaps another session, show inline error: "This overlaps with another session"
- Save button is disabled while errors are present
- Validation runs both client-side (immediate feedback) and server-side (security)

**Design:**
- Inline error text: `text-[--color-error]` (`#dc2626`), muted size — `text-sm`; appears immediately below the offending field
- Errored input border: `border-[--color-error]`
- Save button in disabled state: reduced opacity (`opacity-50`), `cursor-not-allowed`
- Modal container: `bg-[--color-card]`, `rounded-2xl`, `p-4`; entrance: `motion-safe:animate-slide-up`

---

**Key files:** `src/components/SessionDetail.tsx`, `src/actions/fasting.ts` (`updateSession`), `src/lib/validators.ts`
