# Epic 4: Notes

Optional free-text notes on each session. Max 280 characters, enforced at both the DB (`@db.VarChar(280)`) and UI level.

---

## US-4.1 — Add a note to a session

*As a user, I want to add an optional note to a fasting session so that I can record how I felt or why I broke the fast.*

**Acceptance criteria:**
- A text input is available on the active fast screen and on the session detail modal
- Notes are free-text, max 280 characters
- Character counter visible when typing
- Notes are saved via server action

**Design:**
- Textarea: `rounded-xl`, `bg-[--color-background]`, body text (`text-base text-slate-700`), `p-4` internal padding, `min-h-11` touch area
- Placeholder text: `text-[--color-text-muted]`
- Character counter: muted level — `text-sm text-[--color-text-muted]`, right-aligned below the input; turns `text-[--color-error]` when approaching/at 280

---

## US-4.2 — Edit a note

*As a user, I want to edit or delete a note after the session is completed.*

**Acceptance criteria:**
- From session detail, I can tap the note to edit it
- I can clear the note entirely
- Changes persist via server action

**Design:**
- Existing note in session detail: body text level, `bg-[--color-background]` inset, `rounded-xl`, tappable (`min-h-11`)
- Note preview in history list (SessionCard): muted level — `text-sm text-[--color-text-muted]`, truncated to one line with `truncate`

---

**Key files:** `src/components/ActiveFast.tsx` (inline note input), `src/components/SessionDetail.tsx`, `src/actions/fasting.ts` (`updateSession`)
