---
description: "Task list for Authentication feature"
---

# Tasks: Authentication

**Input**: Design documents from `specs/001-authentication/`
**Branch**: `001-authentication`
**Stack**: TypeScript, Next.js 14+ App Router, Auth.js v5, Prisma, Vercel Postgres, Tailwind CSS

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup

**Purpose**: Project bootstrap and shared infrastructure

- [x] T001 Bootstrap Next.js project: `npx create-next-app@latest fasttrack --typescript --tailwind --app --src-dir --import-alias "@/*"`
- [x] T002 Install auth and ORM dependencies: `npm install next-auth@beta prisma @prisma/client`
- [x] T003 [P] Create `prisma/schema.prisma` with `User` and `UserSettings` models per `specs/001-authentication/data-model.md`
- [x] T004 [P] Create `.env.local` with all required env vars: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTHORIZED_EMAIL`, `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`
- [ ] T005 Run initial Prisma migration: `npx prisma migrate dev --name init-auth`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create Prisma client singleton in `src/lib/prisma.ts` (global reuse pattern to prevent connection exhaustion in serverless)
- [x] T007 Create Auth.js config in `src/lib/auth.ts` — Google provider, `signIn` callback rejecting non-`AUTHORIZED_EMAIL` addresses, `signIn` callback upserting User + nested creating UserSettings, JWT session `maxAge: 30d / updateAge: 24h`, session callback attaching `user.id`, pages config `signIn: "/auth/signin"`, export `{ auth, handlers, signIn, signOut }`
- [x] T008 Create Auth.js route handler in `src/app/api/auth/[...nextauth]/route.ts` — re-export `handlers` as `GET` and `POST`
- [x] T009 Create middleware in `src/middleware.ts` — export `auth` as default, `authorized` callback returns `!!auth`, matcher excludes `_next/static`, `_next/image`, `favicon.ico`, `api/auth`

**Checkpoint**: Foundation ready — `auth()` is usable in server components and all routes are protected. User story implementation can begin.

---

## Phase 3: User Story 1 — Sign In with Google (Priority: P1) 🎯 MVP

**Goal**: Owner can sign in with Google, is restricted by email, and User + UserSettings records are created on first login.

**Independent Test**: Open app in fresh browser → redirects to `/auth/signin` → click "Sign in with Google" → authenticate with authorized email → lands on home page. Check database for User and UserSettings records. Attempt sign-in with unauthorized email → error message appears.

### Implementation for User Story 1

- [x] T010 [US1] Create sign-in page Server Component in `src/app/auth/signin/page.tsx`:
  - Read `searchParams.error` to detect `AccessDenied` vs OAuth provider errors
  - Layout: `min-h-screen bg-[--color-background] flex items-center justify-center`
  - Card: `bg-[--color-card] rounded-2xl p-4 shadow-sm motion-safe:animate-fade-in`
  - App headline: `text-3xl font-bold text-[--color-text]` with app name "FastTrack"
  - Subtitle: `text-base text-[--color-text-muted]`
- [x] T011 [US1] Add "Sign in with Google" button to `src/app/auth/signin/page.tsx`:
  - Form with server action calling `signIn("google")`
  - Button: `bg-[--color-primary] text-white rounded-full min-h-11 min-w-11 px-6 font-medium hover:bg-[--color-primary-dark] transition-colors`
  - Google icon from Lucide React or inline SVG
- [x] T012 [US1] Add error display to `src/app/auth/signin/page.tsx`:
  - `AccessDenied` error → "This app is private. Access denied." in `text-[--color-error] text-base animate-shake` (no `motion-safe:`)
  - OAuth/provider error → "Sign-in is temporarily unavailable. Please try again later." in `text-[--color-error] text-base`
  - No error → render nothing in error slot
- [x] T013 [P] [US1] Add TypeScript module augmentation in `src/types/next-auth.d.ts` to extend `Session.user` with `id: string`

**Checkpoint**: User Story 1 fully functional. Navigate to `/` → redirected to sign-in → sign in → home page. Unauthorized email → error. Database records created.

---

## Phase 4: User Story 2 — Stay Signed In (Priority: P2)

**Goal**: Session persists for 30 days with sliding window renewal. Owner never re-authenticates within the window.

**Independent Test**: Sign in → close browser entirely → reopen → navigate to `/` → lands on home page without redirect. Confirm session cookie has 30-day expiry.

### Implementation for User Story 2

- [x] T014 [US2] Verify JWT session config in `src/lib/auth.ts`: `session.maxAge = 30 * 24 * 60 * 60`, `session.updateAge = 24 * 60 * 60` — no new file, confirm the values are correct and the session cookie is set to `httpOnly: true, secure: true` in production
- [x] T015 [US2] Add session persistence acceptance test to `specs/001-authentication/quickstart.md` checklist (manual step: close browser, reopen, verify no redirect)

**Checkpoint**: User Story 2 verified. Session persists across browser restarts.

---

## Phase 5: User Story 3 — Sign Out (Priority: P3)

**Goal**: Owner can sign out from the settings page, clearing the session and returning to the sign-in screen.

**Independent Test**: Navigate to `/settings` → tap sign-out → redirected to `/auth/signin` → navigate to `/` → redirected to `/auth/signin` again (session cleared).

### Implementation for User Story 3

- [x] T016 [US3] Create placeholder settings page in `src/app/settings/page.tsx` (minimal — full settings is Epic 10):
  - Server Component; call `auth()` and assert session (middleware already protects, but defense-in-depth)
  - Heading: `text-3xl font-bold text-[--color-text]` — "Settings"
  - Sign-out section at bottom of page
- [x] T017 [US3] Add sign-out form/button to `src/app/settings/page.tsx`:
  - Form with server action calling `signOut({ redirectTo: "/auth/signin" })`
  - Button: `text-[--color-error] text-base min-h-11` (destructive text button, no background)
  - Label: "Sign out"

**Checkpoint**: All 3 user stories functional and independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T018 [P] Add Tailwind CSS design token `@theme` block to `src/index.css` with all `--color-*`, animation tokens per `docs/design-tokens.md` (prerequisite for all future UI work)
- [x] T019 [P] Create placeholder home page `src/app/page.tsx` — Server Component, call `auth()`, display "Welcome [name]" (protected by middleware already; full home page is Epic 2)
- [ ] T020 Run quickstart verification checklist from `specs/001-authentication/quickstart.md` — confirm all 8 checkboxes pass
- [ ] T021 [P] Commit all files to `001-authentication` branch

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately. T003 and T004 can run in parallel.
- **Foundational (Phase 2)**: Depends on T005 (migration complete). T006–T009 must run in order: prisma.ts → auth.ts → route.ts → middleware.ts
- **User Stories (Phase 3–5)**: All depend on Foundational (Phase 2) complete
  - US1 (Phase 3): No dependency on US2 or US3
  - US2 (Phase 4): Independent — only verifies existing JWT config
  - US3 (Phase 5): Needs a settings page stub (T016) but no US1/US2 code
- **Polish (Phase 6)**: All user stories complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no inter-story dependencies
- **US2 (P2)**: Can start after Phase 2 — verifies config set in T007
- **US3 (P3)**: Can start after Phase 2 — independent, creates `/settings` stub

### Parallel Opportunities

- T003 + T004 can run in parallel (different files)
- T010, T013 can run in parallel once T007 is done (different files)
- T011, T012 both edit `signin/page.tsx` — run sequentially
- T014, T015 can run in parallel (T014 is verification, T015 is docs)
- T018, T019 can run in parallel in Phase 6
- T020, T021 are sequential (verify then commit)

---

## Parallel Example: Phase 2 Foundation

```bash
# Sequential — each depends on the previous:
Task: "Create Prisma client singleton in src/lib/prisma.ts"         # T006
Task: "Create Auth.js config in src/lib/auth.ts"                    # T007 (imports prisma)
Task: "Create route handler in src/app/api/auth/[...nextauth]/..."  # T008 (imports handlers)
Task: "Create middleware in src/middleware.ts"                       # T009 (imports auth)
```

## Parallel Example: User Story 1

```bash
# After T007 done, launch in parallel:
Task: "Create sign-in page Server Component in src/app/auth/signin/page.tsx"  # T010
Task: "Add TS module augmentation in src/lib/auth.ts"                          # T013
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T005)
2. Complete Phase 2: Foundation (T006–T009)
3. Complete Phase 3: User Story 1 (T010–T013)
4. **STOP and VALIDATE**: Run quickstart checklist items 1–7
5. Demo: full sign-in/sign-out flow working end-to-end

### Incremental Delivery

1. Setup + Foundation → all routes protected, Google OAuth connected
2. Add US1 → sign-in page, email restriction, DB records → **MVP!**
3. Add US2 → session persistence verified (mostly config validation)
4. Add US3 → sign-out from settings stub
5. Polish → design tokens, home page stub, commit

---

## Notes

- [P] tasks = different files, no dependencies between them
- [Story] label maps task to specific user story for traceability
- No automated test tasks generated (not requested in spec)
- T014/T015 are lightweight — US2 is mostly a configuration verification, not new code
- The settings page created in T016/T017 is a minimal stub; full settings UI is Epic 10
- `animate-shake` on error messages MUST NOT use `motion-safe:` — constitution Principle V
- `AUTH_SECRET` must be generated with `openssl rand -base64 32` — never commit to Git
