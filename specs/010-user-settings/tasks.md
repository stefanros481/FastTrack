# Tasks: User Settings

**Input**: Design documents from `/specs/010-user-settings/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create shared server actions and foundational components needed by multiple user stories

- [x] T001 Add `getUserProfile()` server action in `src/app/actions/settings.ts` that fetches `User.name`, `User.email`, `User.image` by authenticated userId — per contracts/settings-actions.md

**Checkpoint**: Profile data fetching ready — user story components can import it.

---

## Phase 2: Foundational (Settings Page Scaffold)

**Purpose**: Restructure the settings page into sections with proper layout — MUST be complete before user story components are added

- [x] T002 Rewrite `src/app/settings/page.tsx` as a server component that fetches session, user profile (via `getUserProfile()`), and all settings (theme, defaultGoal, notification prefs). Render the page with section layout per contracts/settings-page.md: Profile section at top, then Fasting, Notifications, Appearance, and Account sections with `gap-8` spacing, card styling (`bg-[--color-card]`, `rounded-2xl`, `p-4`), and `motion-safe:animate-fade-in` entrance animation

**Checkpoint**: Settings page loads with section structure. Individual sections will be filled by user story tasks.

---

## Phase 3: User Story 1 — Settings Page with User Profile (Priority: P1) MVP

**Goal**: Display the user's profile image, name, and email at the top of the settings page.

**Independent Test**: Navigate to `/settings`, verify profile image (or letter fallback), name, and email are displayed.

### Implementation for User Story 1

- [x] T003 [US1] Create `src/components/UserProfile.tsx` as a client component that accepts `{ name: string | null, email: string, image: string | null }` props. Display a circular avatar (48px) with the profile image. On image error or if image is null, show a letter-based fallback avatar (first letter of name, or first letter of email if no name) in a colored circle. Display name (or "User" if null) and email below/beside the avatar

**Checkpoint**: Profile section shows user identity with image or fallback avatar.

---

## Phase 4: User Story 2 — Theme Selection (Priority: P1)

**Goal**: Users can switch between dark, light, and system themes from the settings page.

**Independent Test**: Change theme in settings, verify it applies immediately and persists across page reloads.

### Implementation for User Story 2

- [x] T004 [US2] Create `src/components/ThemeSelector.tsx` as a client component that accepts `{ currentTheme: string }` props. Render a 3-button segmented control with Lucide icons (Moon for dark, Monitor for system, Sun for light). Highlight the active theme. On selection, call `updateTheme()` server action and update the ThemeProvider context via `useTheme()`. Wrap the settings page in ThemeProvider in `src/app/settings/page.tsx` (passing the fetched theme as `initialTheme`) so the ThemeSelector can access the theme context

**Checkpoint**: Theme changes apply immediately across the app and persist across sessions.

---

## Phase 5: User Story 3 — Default Fasting Goal (Priority: P2)

**Goal**: Users can set or clear a default fasting goal from settings.

**Independent Test**: Set a default goal in settings, start a fast from home, verify goal is pre-selected.

### Implementation for User Story 3

- [x] T005 [US3] Integrate the existing `DefaultGoalSetting` component in `src/app/settings/page.tsx` within the "Fasting" section — pass `currentDefault` prop from the fetched `defaultGoalMinutes`. No new component needed; this is already implemented

**Checkpoint**: Default goal setting works within the settings page layout.

---

## Phase 6: User Story 4 — Sign Out (Priority: P2)

**Goal**: Users can sign out from the settings page.

**Independent Test**: Tap sign out, verify redirect to sign-in page.

### Implementation for User Story 4

- [x] T006 [P] [US4] Create `src/components/SignOutButton.tsx` as a client component that calls `signOut()` from `@/lib/auth` via a server action form. Style with `text-[--color-error]` or muted destructive styling per the design system. Position in the "Account" section at the bottom of the settings page

**Checkpoint**: Sign out works from settings page.

---

## Phase 7: User Story 5 — Notification Preferences (Priority: P3)

**Goal**: Users can configure daily reminder toggle, reminder time, and max duration alert.

**Independent Test**: Toggle reminders on, set time and max duration, verify preferences persist.

### Implementation for User Story 5

- [x] T007 [US5] Add `getNotificationSettings()`, `updateReminderSettings(enabled, time)`, and `updateMaxDuration(minutes)` server actions in `src/app/actions/settings.ts` per contracts/settings-actions.md — validate reminder time as `HH:MM` format and max duration between 60–4320 minutes
- [x] T008 [US5] Create `src/components/NotificationSettings.tsx` as a client component that accepts `{ reminderEnabled: boolean, reminderTime: string | null, maxDurationMinutes: number | null }` props. Render: a toggle for daily reminders, a time input (visible only when toggle is on) for reminder time, and a number input for max duration alert (in hours). Call the respective server actions on change. Use `useTransition()` for optimistic UI updates

**Checkpoint**: Notification preferences are configurable and persisted.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [x] T009 Run TypeScript type check (`npx tsc --noEmit`) and fix any type errors across all modified/new files
- [x] T010 [P] Verify settings page accessibility: all interactive elements meet `min-h-11` touch target, proper labels on form controls, keyboard navigable
- [x] T011 [P] Update `CLAUDE.md` to add settings page to key files list and note the new components

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001 can start immediately
- **Foundational (Phase 2)**: Depends on T001 — T002 needs `getUserProfile()`
- **User Stories (Phase 3–7)**: All depend on Phase 2 completion (page scaffold)
  - US1 (Phase 3): Profile component — depends on Phase 2
  - US2 (Phase 4): Theme selector — depends on Phase 2
  - US3 (Phase 5): Goal setting — depends on Phase 2 (integration only)
  - US4 (Phase 6): Sign out — depends on Phase 2
  - US5 (Phase 7): Notifications — depends on Phase 2
- **Polish (Phase 8)**: Depends on all user stories complete

### Within Each Phase

```
T001 → T002 → T003 + T004 + T005 + T006 (parallel, different files)
                     T007 → T008 (sequential within US5)
                     → T009 + T010 + T011 (parallel polish)
```

### Parallel Opportunities

- T003, T004, T005, T006 can all run in parallel (different component files)
- T007 and T008 are sequential (actions before UI)
- T009, T010, T011 can run in parallel
- US1, US2, US3, US4 can all run in parallel with each other

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Phase 1: `getUserProfile()` action (T001)
2. Complete Phase 2: Page scaffold (T002)
3. Complete Phase 3: User profile component (T003)
4. Complete Phase 4: Theme selector (T004)
5. **STOP and VALIDATE**: Profile + theme working in settings
6. Deploy if ready — core settings page functional

### Incremental Delivery

1. T001 → T002 → T003 + T004 → **Profile + Theme MVP deployed**
2. T005 → Default goal integrated
3. T006 → Sign out extracted
4. T007 + T008 → Notification preferences added
5. T009 + T010 + T011 → Polish complete

---

## Notes

- No database migrations needed — all `UserSettings` fields already exist
- The existing `DefaultGoalSetting` component requires no changes — just integration into the new layout
- The existing `ThemeProvider` and `useTheme` hook are reused by the new `ThemeSelector`
- Home page `ThemeToggle` in `FastingTimer.tsx` is NOT modified — it continues working independently
- Total: 2 modified files (`settings/page.tsx`, `actions/settings.ts`) + 4 new components
