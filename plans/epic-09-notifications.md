# Epic 9: Notifications & Reminders

Browser Notification API with in-app toast as fallback. All preferences stored in `UserSettings`. Permission is requested on first enable.

---

## US-9.1 — Daily reminder to start fasting

*As a user, I want to receive a daily reminder to start my fast so that I stay consistent.*

**Acceptance criteria:**
- Settings toggle to enable/disable
- Configurable time (HH:mm)
- Browser Notification API with permission prompt on first enable
- In-app toast fallback if permission denied
- Preference stored in `UserSettings.reminderEnabled` + `UserSettings.reminderTime`

**Design:**
- Toggle: pill-style switch, active state `bg-[--color-primary]`; `min-h-11` touch target for the row
- Time input (shown when enabled): `rounded-xl`, `bg-[--color-background]`, body text, `min-h-11`
- In-app toast (fallback): `bg-[--color-card]`, `rounded-2xl`, `p-4`, body text; entrance: `motion-safe:animate-slide-up`; warning colour `text-[--color-warning]` for permission-denied state

---

## US-9.2 — Max duration reminder

*As a user, I want a reminder if I've been fasting beyond a certain duration so that I don't overdo it.*

**Acceptance criteria:**
- Settings option with configurable max duration
- Notification fires when active fast exceeds the max
- Only fires once per session
- Stored in `UserSettings.maxDurationMinutes`

**Design:**
- Settings row: body text label left, duration input right; `min-h-11`, `border-b border-slate-100` separator
- In-app toast: `bg-[--color-warning]` tint, body text; entrance: `motion-safe:animate-slide-up`

---

**Note:** Goal-reached notification (fires when elapsed time >= goal) is part of Epic 5 (US-5.3) but shares the same toast/notification infrastructure.

**Key files:** `src/components/ActiveFast.tsx` (notification trigger logic), `src/app/settings/page.tsx`, `src/actions/settings.ts`
