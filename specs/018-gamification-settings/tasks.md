# Tasks: Gamification Settings & Opt-In

**Input**: Design documents from `/specs/018-gamification-settings/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Schema changes and migration -- foundation for all gamification settings

- [x] T001 Add 5 gamification fields to UserSettings model in `prisma/schema.prisma`: `gamificationEnabled` (Boolean?), `gamificationAchievements` (Boolean, default true), `gamificationWhosFasting` (Boolean, default true), `gamificationLeaderboard` (Boolean, default true), `gamificationChallenge` (Boolean, default true)
- [x] T002 Run `bunx prisma migrate dev --name add-gamification-settings` to generate and apply migration

**Checkpoint**: Database schema updated. Existing users get null for gamificationEnabled and true for all feature toggles.

---

## Phase 2: Foundational (Server Actions)

**Purpose**: Server-side data access layer that all UI components depend on

- [x] T003 Add `getGamificationSettings()` server action in `src/app/actions/settings.ts` -- returns `{ enabled: boolean | null, achievements: boolean, whosFasting: boolean, leaderboard: boolean, challenge: boolean }`, follows existing `getUserId()` + `prisma.userSettings.findUnique` pattern
- [x] T004 Add `updateGamificationSettings(settings: { enabled?: boolean, achievements?: boolean, whosFasting?: boolean, leaderboard?: boolean, challenge?: boolean })` server action in `src/app/actions/settings.ts` -- accepts partial update object, validates input with Zod schema (`z.object({ enabled: z.boolean().optional(), achievements: z.boolean().optional(), whosFasting: z.boolean().optional(), leaderboard: z.boolean().optional(), challenge: z.boolean().optional() })`) server-side before calling `prisma.userSettings.update`, follows existing pattern. Note: client-side Zod validation is omitted because inputs are programmatic booleans from toggle clicks, not user-typed text.

**Checkpoint**: Server actions ready. Can be tested by calling from a temporary page or console.

---

## Phase 3: User Story 1 & 2 - Opt-In Splash + Master Toggle (Priority: P1)

**Goal**: Users see a one-time splash when gamification preference is undecided, and can toggle gamification on/off from Settings.

**Independent Test**: Load timer view with gamificationEnabled=null -- splash appears. Choose option -- splash gone. Go to Settings -- master toggle reflects choice and can be changed.

### Implementation

- [x] T005 [US1] Create `src/components/GamificationOptIn.tsx` -- full-screen overlay with backdrop, "Join the Community?" title, description of 4 features (achievements, who's fasting, leaderboard, challenges), "Join In" primary button and "No Thanks" secondary button, "You can change this anytime in Settings" subtext. Uses `motion-safe:animate-slide-up` entrance. Calls `updateGamificationSettings({ enabled: true/false })` via server action. Uses optimistic state to dismiss immediately.
- [x] T006 [US1] Modify `src/app/page.tsx` -- add `getGamificationSettings()` to existing `Promise.all`, pass `gamificationEnabled` prop to `FastingTimer`
- [x] T007 [US1] Modify `src/components/FastingTimer.tsx` -- add `gamificationEnabled: boolean | null` to Props interface, import and render `<GamificationOptIn />` overlay when `gamificationEnabled === null`, manage local state for optimistic dismissal after user choice
- [x] T008 [P] [US2] Create `src/components/GamificationSettings.tsx` -- client component with master "Enable Gamification" toggle using same toggle pattern as `NotificationSettings.tsx` (w-12 h-7 rounded-full switch). Uses `useState` + `useTransition` for optimistic updates. Calls `updateGamificationSettings({ enabled })`. When enabled is false or null, shows toggle in off position. Props: `{ enabled: boolean | null, achievements: boolean, whosFasting: boolean, leaderboard: boolean, challenge: boolean }`
- [x] T009 [US2] Modify `src/app/settings/page.tsx` -- import `getGamificationSettings` and `GamificationSettings`, add to `Promise.all`, add new "Community" section between Notifications and Account sections with h2 heading and card container, pass all gamification props to `GamificationSettings`

**Checkpoint**: Splash screen appears for undecided users, master toggle works in Settings. Both P1 stories functional.

---

## Phase 4: User Story 3 - Individual Feature Toggles (Priority: P2)

**Goal**: Users with gamification enabled can selectively toggle individual features on/off.

**Independent Test**: Enable gamification, then toggle individual features -- each persists independently on reload.

### Implementation

- [x] T010 [US3] Modify `src/components/GamificationSettings.tsx` -- add 4 individual feature toggles below master toggle, each with label ("Achievements & Badges", "Who's Fasting Now", "Group Leaderboard", "Weekly Challenge") and same toggle switch pattern. Only visible when master toggle is enabled (use `{enabled && ...}` with `motion-safe:animate-fade-in`). Each toggle calls `updateGamificationSettings` with its specific field. Uses `useTransition` for each toggle.

**Checkpoint**: All 3 user stories complete. Settings page shows master + individual toggles. Splash works for undecided users.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and build check

- [x] T011 Run `bun run build` to verify no TypeScript errors
- [ ] T012 Manually test dark mode rendering of splash screen and settings toggles. Verify toggle interactions complete within 1 second (SC-005).
- [ ] T013 Manually test on 375px viewport -- verify splash and toggles are fully visible and touch-friendly (44x44px targets). Verify toggle response time under 1 second on mobile.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies -- start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (migration must complete first)
- **US1 Splash + US2 Master Toggle (Phase 3)**: Depends on Phase 2 (server actions must exist)
  - T005 and T008 can run in parallel (different files)
  - T006, T007, T009 depend on their respective components being created
- **US3 Feature Toggles (Phase 4)**: Depends on T008 (modifies same component)
- **Polish (Phase 5)**: Depends on all previous phases

### User Story Dependencies

- **US1 (Splash)**: Needs server actions (Phase 2). Independent of US2/US3.
- **US2 (Master Toggle)**: Needs server actions (Phase 2). Independent of US1/US3. Can be built in parallel with US1.
- **US3 (Feature Toggles)**: Needs US2 complete (extends `GamificationSettings.tsx` created in US2).

### Parallel Opportunities

- T005 (GamificationOptIn) and T008 (GamificationSettings) can be created in parallel -- different files
- T006 (page.tsx) and T009 (settings/page.tsx) can be modified in parallel -- different files

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Schema + migration
2. Complete Phase 2: Server actions
3. Complete Phase 3: Splash screen + master toggle
4. **STOP and VALIDATE**: Test splash flow and settings toggle
5. Deploy if ready

### Full Delivery

1. MVP above
2. Add US3: Individual feature toggles
3. Polish: Build check, dark mode, mobile viewport
4. Each increment adds value without breaking previous work
