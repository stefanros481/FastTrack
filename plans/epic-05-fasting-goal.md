# Epic 5: Fasting Goal

Users can set a target duration per session. Progress is shown as a circular ring. A celebration animation fires when the goal is reached, and a browser notification is sent.

**Data:** `FastingSession.goalMinutes` (nullable), `UserSettings.defaultGoalMinutes`

---

## US-5.1 — Set a fasting goal

*As a user, I want to set a target duration for my fast so that I have a goal to work toward.*

**Acceptance criteria:**
- When starting a fast, I can optionally set a goal
- Quick-select options: 12h, 16h, 18h, 20h, 24h
- Custom input for any duration
- Goal stored as `goalMinutes` on the session record
- If a default goal exists in settings, it pre-fills

**Design:**
- Quick-select pills: `rounded-full`; inactive: `bg-[--color-primary-light] text-[--color-primary-dark]`; selected: `bg-[--color-primary] text-white`
- Custom duration input: `rounded-xl`, `bg-[--color-background]`, body text, `min-h-11`
- Section label: Heading level — `text-xl font-semibold text-[--color-text]`

---

## US-5.2 — View goal progress

*As a user, I want to see my progress toward my fasting goal as a visual indicator so that I stay motivated.*

**Acceptance criteria:**
- A circular progress ring shows percentage toward the goal
- Remaining time displayed (e.g., "4h 23m to go")
- Ring fills as time progresses
- When goal is reached, ring completes with a subtle celebration animation

**Design:**
- Progress ring stroke: `--color-primary` on a `--color-primary-light` track
- Elapsed/percentage inside ring: Display level — `text-3xl font-bold text-[--color-text]`
- "X to go" label: Muted — `text-sm text-[--color-text-muted]`
- Goal reached: ring stroke → `--color-success`; completion checkmark: `motion-safe:animate-bounce-in`

---

## US-5.3 — Goal reached notification

*As a user, I want to be notified when I reach my fasting goal so that I know I can break my fast.*

**Acceptance criteria:**
- Browser notification fires when elapsed time >= goal duration
- In-app toast notification as fallback
- Notification text: "You've reached your [X]h fasting goal!"

**Design:**
- In-app toast: `bg-[--color-success]` background, white text, `rounded-xl`, `p-4`; entrance: `motion-safe:animate-slide-up`

---

## US-5.4 — Default goal in settings

*As a user, I want to set a default fasting goal so that I don't have to pick one every time.*

**Acceptance criteria:**
- Settings page has a "Default goal" option
- New sessions auto-fill with the default goal
- Can be overridden per session
- Stored in `UserSettings.defaultGoalMinutes`

**Design:**
- Settings row: body text label left, value/selector right, `min-h-11`, `border-b border-slate-100` separator

---

**Key files:** `src/components/ActiveFast.tsx` (progress ring), `src/components/StartFast.tsx` (goal picker), `src/actions/settings.ts`, `src/app/settings/page.tsx`
