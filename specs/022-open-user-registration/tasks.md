# Tasks: Open User Registration

**Input**: Design documents from `/specs/022-open-user-registration/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks omitted. See quickstart.md for manual testing checklist.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Constitution amendment, schema changes, and type system updates that all stories depend on

- [x] T001 Amend Constitution Principle II in `.specify/memory/constitution.md` — replace "up to 5 email addresses listed in AUTHORIZED_EMAILS" with "database-driven role and active-status system with configurable user cap (MAX_USERS env var, default 200)". Add admin data access carve-out: "Admin-role users MAY access user management data (user list, role, active status) but MUST NOT access other users' fasting sessions, settings, or statistics." Update version from 2.0.0 to 2.1.0 and LAST_AMENDED_DATE. Update Sync Impact Report comment.
- [x] T002 Add `role` (String, default "user") and `isActive` (Boolean, default true) fields to User model in `prisma/schema.prisma`
- [x] T003 Run Prisma migration: `bunx prisma migrate dev --name add_user_role_and_active_status`
- [x] T004 Add `role: string` and `isActive: boolean` to Session user type augmentation in `src/types/next-auth.d.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Auth system refactor — remove env-based allowlist, switch to DB-driven authorization

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Remove all imports of `isAuthorizedEmail` and `getAuthorizedEmails` from `src/lib/auth.ts`, `src/lib/auth.config.ts`, and `src/app/auth/signin/page.tsx`
- [x] T006 Delete `src/lib/authorized-emails.ts` — remove the file entirely
- [x] T007 Update `authorized` callback in `src/lib/auth.config.ts` — replace `isAuthorizedEmail` check with a Prisma DB query: look up user by email and check `isActive === true`. Import prisma client. Return false if user not found or inactive.
- [x] T008 Update `signIn` callback in `src/lib/auth.ts` — remove `isAuthorizedEmail` gate. Check user cap (`MAX_USERS` env var, default 200): if user count >= cap AND email not already in DB, return false with redirect to `?error=RegistrationClosed`. Upsert user with `isActive: true`, `role: "user"` for new users. Preserve existing upsert behavior that updates name/image from Google profile on each sign-in (FR-011). If existing user has `isActive: false`, return false with redirect to `?error=AccountInactive`. Add auto-admin bootstrap: after upsert, check if no admin exists in DB (`WHERE role = "admin"`). If none found, promote the current sign-in user to admin. This handles both fresh deploys (first user) and existing deploys (first user to sign in post-migration).
- [x] T009 Update `jwt` callback in `src/lib/auth.ts` — after DB lookup, set `token.role = dbUser.role` and `token.isActive = dbUser.isActive` alongside existing `token.sub = dbUser.id`
- [x] T010 Update `session` callback in `src/lib/auth.ts` — propagate `token.role` and `token.isActive` to `session.user.role` and `session.user.isActive`
- [x] T011 Update dev-credentials provider in `src/lib/auth.ts` — remove `isAuthorizedEmail` check from `authorize` function. Allow any email in dev mode. Ensure dev users also get role/isActive from DB.

**Checkpoint**: Auth system now uses DB-driven authorization. Any Google user can sign in (up to cap). Deactivated users are blocked per-request. First user (or first sign-in post-migration) auto-becomes admin.

---

## Phase 3: User Story 1 + 3 — Self-Service Sign-Up & First User Auto-Admin (Priority: P1) MVP

**Goal**: Any Google user can sign up without env-var config. First user on a fresh deployment auto-becomes admin. Sign-in page shows appropriate error messages.

**Independent Test**: Sign in with a new Google account on a fresh instance — verify account is created with admin role. Sign in with a second account — verify it gets "user" role. Remove `AUTHORIZED_EMAILS` env var — verify app still works.

### Implementation

- [x] T012 [US1] Update sign-in page `src/app/auth/signin/page.tsx` — remove `getAuthorizedEmails()` import and dev email dropdown. Add error message handling for `?error=RegistrationClosed` ("Registration is currently closed") and `?error=AccountInactive` ("Your account has been deactivated. Contact the app admin."). Update dev login to use a freeform email text input instead of select.
- [x] T013 [US1] Add `MAX_USERS` env var documentation — update `.env.example` (if exists) or add a comment in `src/lib/auth.ts` noting the `MAX_USERS` env var (default: 200).

**Checkpoint**: Open registration works. First user is admin. User cap enforced. Sign-in page shows appropriate error messages.

---

## Phase 4: User Story 2 — Admin User Management (Priority: P1)

**Goal**: Admins can view all users, deactivate/reactivate users, and promote/demote roles from a management screen in settings.

**Independent Test**: Sign in as admin, navigate to Settings > User Management. Verify user list shows all users with status. Deactivate a user, verify they're blocked on next request. Reactivate, verify access restored. Promote a user to admin, verify they see user management too.

### Implementation

- [x] T014 [P] [US2] Create admin server actions in `src/app/actions/admin.ts` — implement `getUsers()`, `deactivateUser(userId)`, `reactivateUser(userId)`, `promoteToAdmin(userId)`, `demoteFromAdmin(userId)`. Each action: verify caller is admin via `auth()`, validate input with Zod, enforce business rules (last-admin protection, self-deactivation prevention). Use `revalidatePath` for cache invalidation.
- [x] T015 [P] [US2] Create admin user list client component `src/components/AdminUserList.tsx` — display users in a list/table with name, email, avatar, role badge, active status badge, sign-up date. Action buttons per user: Deactivate/Reactivate toggle, Promote/Demote toggle. Show current user count vs MAX_USERS cap. Disable dangerous actions (deactivate self, demote last admin) with tooltips explaining why. Include client-side Zod validation of userId before calling server actions (Constitution Principle IV). Use existing design tokens, Lucide icons, and mobile-first layout (44px touch targets).
- [x] T016 [US2] Create admin page `src/app/settings/admin/page.tsx` — server component that calls `auth()` to verify admin role, redirects non-admins to `/settings`. Fetches user list via `getUsers()` action. Renders `AdminUserList` with the data.
- [x] T017 [US2] Update settings page `src/app/settings/page.tsx` — add an "Admin" or "User Management" section visible only when `session.user.role === "admin"`. Link to `/settings/admin`. Use Shield or Users icon from Lucide.

**Checkpoint**: Full admin user management works. Admins can manage all users from settings.

---

## Phase 5: User Story 4 — Backward Compatibility (Priority: P2)

**Goal**: Existing deployments migrate seamlessly. All current users keep access.

**Independent Test**: Deploy to an instance with existing users in DB. Verify all users have `isActive: true` and `role: "user"` from migration defaults. Verify the first user to sign in post-migration gets promoted to admin.

### Implementation

- [x] T018 [US4] Verify Prisma migration handles existing data — ensure the migration SQL adds columns with defaults so existing rows get `role: "user"` and `isActive: true` without manual intervention. No data migration script needed beyond the Prisma migration itself. Admin bootstrap is handled by T008's auto-admin logic in the signIn callback.

**Checkpoint**: Existing deployments work seamlessly after migration. First sign-in post-migration bootstraps the admin.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation cleanup and validation

- [x] T019 Update `CLAUDE.md` authentication section — replace references to `AUTHORIZED_EMAILS` as required env var. Document new `MAX_USERS` env var. Update "Required env vars" list. Update "Key auth files" to remove `authorized-emails.ts` and add `src/app/actions/admin.ts`, `src/app/settings/admin/page.tsx`.
- [x] T020 Clean up any remaining references to `authorized-emails` across the codebase — search for imports, comments, or documentation that reference the deleted file or the `AUTHORIZED_EMAILS` / `AUTHORIZED_EMAIL` env vars.
- [ ] T021 Run quickstart.md testing (manual) checklist — manually verify all items pass end-to-end.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately (includes constitution amendment)
- **Foundational (Phase 2)**: Depends on Phase 1 (schema + types + constitution must exist)
- **US1+US3 (Phase 3)**: Depends on Phase 2 (auth callbacks must be refactored)
- **US2 (Phase 4)**: Depends on Phase 2 (role system must exist). Can run in parallel with Phase 3.
- **US4 (Phase 5)**: Depends on Phase 2 (migration must be applied). Can run in parallel with Phase 3 and 4.
- **Polish (Phase 6)**: Depends on all previous phases

### User Story Dependencies

- **US1 + US3 (P1)**: Tightly coupled — auto-admin logic lives in the signIn callback (T008). Sign-in page updates in Phase 3.
- **US2 (P1)**: Independent of US1/US3 — only needs the role/isActive fields to exist (Phase 2).
- **US4 (P2)**: Independent — handled by migration defaults + auto-admin bootstrap in T008.

### Within Each Phase

- T002 → T003 (schema before migration)
- T005 → T006 (remove imports before deleting file)
- T007, T008, T009, T010, T011 can be done sequentially in one pass through auth files
- T014, T015 can run in parallel (different files)
- T016 depends on T014 + T015

### Parallel Opportunities

```text
After Phase 2 completes:
  Phase 3 (US1+US3) ──┐
  Phase 4 (US2)    ───┤── can run in parallel
  Phase 5 (US4)    ───┘

Within Phase 4:
  T014 (server actions) ──┐── can run in parallel
  T015 (UI component)  ───┘
```

---

## Implementation Strategy

### MVP First (Phase 1 + 2 + 3)

1. Complete Phase 1: Constitution amendment + schema migration
2. Complete Phase 2: Auth refactor (remove allowlist, add DB checks, auto-admin bootstrap)
3. Complete Phase 3: Sign-in page updates
4. **STOP and VALIDATE**: New users can sign up, first user is admin, cap works
5. Deploy — app is functional without `AUTHORIZED_EMAILS`

### Incremental Delivery

1. Setup + Foundational → Auth system works with DB
2. Add US1+US3 → Open registration works → Deploy (MVP!)
3. Add US2 → Admin can manage users → Deploy
4. Add US4 → Backward compat verified → Deploy
5. Polish → Docs updated → Final deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 and US3 are combined because they share the same signIn callback logic
- Auto-admin bootstrap (T008) uses "no admin exists" check — covers both fresh deploys and existing deploys
- The `authorized` callback DB query (T007) is the key change enabling per-request deactivation
- Commit after each phase checkpoint
- Total: 21 tasks across 6 phases
