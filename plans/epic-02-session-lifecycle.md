# Epic 2: Fasting Session Lifecycle

Core tracking flow — start, run, stop. The home page shows either a "Start Fast" button (idle) or a live timer (active fast).

**Key data:** `FastingSession` — `startedAt` (required), `endedAt` (nullable; null = active fast)

---

## US-2.1 — Start a fast

*As a user, I want to start a fasting session with a single tap so that the app immediately begins tracking my fast.*

**Acceptance criteria:**
- A prominent "Start Fast" button is visible on the home screen when no fast is active
- Tapping the button calls `startFast()` server action → creates `FastingSession` with `startedAt = now()`
- A live timer begins counting up immediately on the client
- The UI transitions to "active fast" state with a smooth animation
- If a default goal is set in settings, it auto-populates on the new session

**Design:**
- "Start Fast" button: `bg-[--color-primary]`, `rounded-full`, `min-h-11 min-w-11` touch target, centered and dominant
- Idle home screen entrance: `motion-safe:animate-fade-in`
- Transition to active state: `motion-safe:animate-slide-up` on the timer component appearing

---

## US-2.2 — View active fast timer

*As a user, I want to see a live timer showing how long my current fast has been running so that I know my progress at a glance.*

**Acceptance criteria:**
- Timer displays hours, minutes, and seconds (HH:MM:SS)
- Timer updates every second via client-side `setInterval`
- Timer is the dominant visual element on the home screen during an active fast
- Timer survives page refreshes (reads `startedAt` from server)

**Design:**
- Timer text: Display level — `text-3xl font-bold text-[--color-text]` (or larger custom size if needed for dominance)
- Surrounding context labels ("Fasting for", remaining time): Muted level — `text-sm text-[--color-text-muted]`
- Page background: `bg-[--color-background]`

---

## US-2.3 — Stop a fast

*As a user, I want to stop my active fast with a single tap so that the session is completed and saved.*

**Acceptance criteria:**
- A "Stop Fast" button replaces the start button during an active fast
- Tapping calls `stopFast(sessionId)` server action → sets `endedAt = now()`
- A brief summary of the completed session is shown (duration, goal met/missed)
- The UI transitions back to the "ready to fast" state

**Design:**
- "Stop Fast" button: `bg-[--color-error]`, `rounded-full`, `min-h-11 min-w-11` touch target (destructive action)
- Completion summary card: `bg-[--color-card]`, `rounded-xl`, `p-4`; entrance: `motion-safe:animate-slide-up`
- Goal met indicator: `text-[--color-success]`; goal missed: `text-[--color-text-muted]`

---

## US-2.4 — Resume app with active fast

*As a user, I want my active fast to survive closing and reopening the browser so that I don't lose my progress.*

**Acceptance criteria:**
- On app load, the server checks for a session where `endedAt IS NULL`
- If found, the home page renders the active timer computed from `startedAt`
- Timer shows the correct elapsed time (not reset to 0)

---

**Key files:** `src/app/page.tsx`, `src/actions/fasting.ts`, `src/components/ActiveFast.tsx`, `src/components/StartFast.tsx`
