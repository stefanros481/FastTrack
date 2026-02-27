# Tasks: Multi-User Support

**Input**: Design documents from `/specs/009-multi-user-support/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create the shared email parsing utility used by all subsequent phases

- [x] T001 Create `getAuthorizedEmails()` and `isAuthorizedEmail()` functions in `src/lib/authorized-emails.ts` per contracts/authorized-emails.md — edge-compatible, no Prisma imports. Must handle: comma split, trim, lowercase, dedupe, max 5, fallback to `AUTHORIZED_EMAIL` (singular)

**Checkpoint**: Email parsing utility ready — all subsequent tasks can import from it.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create middleware for per-request allowlist validation — MUST be complete before user story work begins

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Update the `authorized` callback in `src/lib/auth.config.ts` to check `isAuthorizedEmail(auth.user.email)` in addition to `!!auth` — import from `src/lib/authorized-emails.ts`. See contracts/middleware.md for the exact callback logic
- [x] T003 Create `middleware.ts` at project root that exports Auth.js middleware using `auth.config.ts`. Add route matcher config to protect all routes except `/auth/*`, `/api/auth/*`, `/_next/*`, `/favicon.ico`, `/robots.txt` per contracts/middleware.md

**Checkpoint**: Foundation ready — every request now validates the user's email against the allowlist. User story implementation can begin.

---

## Phase 3: User Story 1 — Owner Adds Authorized Users (Priority: P1) MVP

**Goal**: Multiple authorized emails (up to 5) can sign in via `AUTHORIZED_EMAILS` env var. Unauthorized emails are rejected.

**Independent Test**: Set `AUTHORIZED_EMAILS=alice@example.com,bob@example.com` in `.env.local`, start dev server, verify both can sign in and a third email is rejected.

### Implementation for User Story 1

- [x] T004 [P] [US1] Update the `signIn` callback in `src/lib/auth.ts` to replace `user.email !== process.env.AUTHORIZED_EMAIL` with `isAuthorizedEmail(user.email)` check — import from `src/lib/authorized-emails.ts`. Keep the existing upsert logic unchanged
- [x] T005 [P] [US1] Update `.env.local.example` to replace `AUTHORIZED_EMAIL=you@gmail.com` with `AUTHORIZED_EMAILS=you@gmail.com` and update the comment to document comma-separated format (up to 5 emails)

**Checkpoint**: Multiple authorized users can sign in with Google OAuth. Unauthorized users are rejected. Existing upsert creates User + UserSettings on first sign-in.

---

## Phase 4: User Story 2 — Data Isolation Between Users (Priority: P1)

**Goal**: Verify each user sees only their own fasting sessions, statistics, and settings — no cross-user data leakage.

**Independent Test**: Sign in as two different dev users, create fasting sessions for each, verify each user's dashboard shows only their own data.

### Implementation for User Story 2

- [x] T006 [P] [US2] Audit all server actions in `src/app/actions/fasting.ts` and `src/app/actions/settings.ts` to confirm every query includes `where: { userId }` scoping. Document the audit result as a comment at the top of each file (e.g., `// Multi-user audit: all queries scoped by userId ✓`)
- [x] T007 [P] [US2] Audit API routes in `src/app/api/sessions/route.ts` and `src/app/api/stats/charts/route.ts` to confirm userId scoping. Add audit comment to each file

**Checkpoint**: Data isolation verified via code audit. Each user's fasting history, statistics, charts, and settings are scoped to their `userId`.

---

## Phase 5: User Story 3 — Independent User Settings (Priority: P2)

**Goal**: Each user gets their own `UserSettings` on first sign-in; preferences are independent.

**Independent Test**: Sign in as two different dev users, set different default goals and themes for each, verify each user sees their own settings.

### Implementation for User Story 3

- [x] T008 [US3] Verify the upsert in `src/lib/auth.ts` `signIn` callback creates `UserSettings` via `settings: { create: {} }` for each new user — this already exists, confirm it works for multiple distinct users by reviewing the code path

**Checkpoint**: Each authorized user gets independent settings. No code changes expected — this is a verification story since the existing upsert already creates per-user settings.

---

## Phase 6: User Story 4 — Backward Compatibility Migration (Priority: P2)

**Goal**: Existing single-user deployments using `AUTHORIZED_EMAIL` (singular) continue working without configuration changes.

**Independent Test**: Set only `AUTHORIZED_EMAIL=legacy@example.com` (no `AUTHORIZED_EMAILS`), verify sign-in works. Then set both, verify `AUTHORIZED_EMAILS` takes precedence.

### Implementation for User Story 4

- [x] T009 [US4] Verify backward compatibility is handled by `getAuthorizedEmails()` in `src/lib/authorized-emails.ts` (created in T001) — the fallback to `AUTHORIZED_EMAIL` should already be implemented. Confirm by reviewing the function

**Checkpoint**: Legacy `AUTHORIZED_EMAIL` deployments continue working. Migration is seamless.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Dev experience improvements and cleanup

- [x] T010 [P] Update dev credentials provider in `src/lib/auth.config.ts` to accept an `email` credential field per contracts/dev-credentials.md — the `authorize()` function should read `credentials.email`, validate with `isAuthorizedEmail()`, and return a user object with that email
- [x] T011 Update sign-in page in `src/app/auth/signin/page.tsx` to replace the single "Dev Login" button with a form containing a `<select>` dropdown of all emails from `getAuthorizedEmails()` and a submit button. Only visible in development. Follows existing amber-600 styling per contracts/dev-credentials.md
- [x] T012 Update `CLAUDE.md` to replace `AUTHORIZED_EMAIL` references with `AUTHORIZED_EMAILS` in the Authentication section and env vars list

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001 can start immediately
- **Foundational (Phase 2)**: Depends on T001 — T002 and T003 need the email utility
- **User Stories (Phase 3–6)**: All depend on Phase 2 completion
  - US1 (Phase 3): Depends on Phase 2
  - US2 (Phase 4): Can run in parallel with US1 (audit only, no code changes)
  - US3 (Phase 5): Can run in parallel with US1 (verification only)
  - US4 (Phase 6): Can run in parallel with US1 (verification only)
- **Polish (Phase 7)**: T010 depends on T001; T011 depends on T010; T012 is independent

### Within Each Phase

```
T001 → T002 + T003 (parallel) → T004 + T005 (parallel) → T010 → T011
                                 T006 + T007 (parallel, audit)
                                 T008 (verification)
                                 T009 (verification)
                                 T012 (independent)
```

### Parallel Opportunities

- T002 and T003 can run in parallel (different files)
- T004 and T005 can run in parallel (different files)
- T006 and T007 can run in parallel (different files, audit only)
- US2, US3, US4 can all run in parallel with US1
- T012 can run any time after Phase 2

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Create email parsing utility (T001)
2. Complete Phase 2: Middleware + authorized callback (T002, T003)
3. Complete Phase 3: Update sign-in callback + env example (T004, T005)
4. **STOP and VALIDATE**: Test with multiple emails in `AUTHORIZED_EMAILS`
5. Deploy if ready — multi-user sign-in works

### Incremental Delivery

1. T001 → T002 + T003 → T004 + T005 → **MVP deployed**
2. T006 + T007 → Data isolation audit complete
3. T008 + T009 → Settings + backward compat verified
4. T010 + T011 + T012 → Dev experience polished

---

## Notes

- No database migrations needed — schema already multi-user ready
- US2, US3, US4 are primarily audit/verification tasks, not new code
- The bulk of new code is in T001 (utility), T002–T003 (middleware), T004 (sign-in callback), T010–T011 (dev credentials)
- Total: 6 files touched (2 new + 4 modified)
