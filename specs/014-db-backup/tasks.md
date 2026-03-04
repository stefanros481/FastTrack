# Tasks: Database Backup

**Input**: Design documents from `/specs/014-db-backup/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and file structure

- [x] T001 Create `scripts/` directory at project root
- [x] T002 [P] Add `backups/` to `.gitignore`
- [x] T003 [P] Create `Makefile` at project root with `backup` target skeleton (echo placeholder)

**Checkpoint**: Directory structure and gitignore ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core export script that all backup functionality depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create `scripts/backup-db.ts` — import Prisma client from `src/lib/prisma.ts`, accept an output directory argument, export all 3 tables (`User`, `FastingSession`, `UserSettings`) as pretty-printed JSON files (`User.json`, `FastingSession.json`, `UserSettings.json`) to the output directory. On database connection failure, print a clear error message (e.g., "Failed to connect to database — check .env.local") and exit with non-zero code. Exit with non-zero code on any other failure.

**Checkpoint**: Running `bun run scripts/backup-db.ts /tmp/test-export` produces 3 JSON files

---

## Phase 3: User Story 1 — Run Full Database Backup (Priority: P1) 🎯 MVP

**Goal**: `make backup` exports tables, zips with timestamp, stores in `backups/`, cleans up temp files

**Independent Test**: Run `make backup` and verify a `backups/backup-YYYY-MM-DD_HH-MM-SS.zip` exists containing `User.json`, `FastingSession.json`, `UserSettings.json`

### Implementation for User Story 1

- [x] T005 [US1] Implement full `backup` target in `Makefile`: create `backups/` dir if missing, create `backups/.tmp/` temp dir, run `bun run scripts/backup-db.ts backups/.tmp`, zip contents of `backups/.tmp/` into `backups/backup-$(date +%Y-%m-%d_%H-%M-%S).zip`, remove `backups/.tmp/`, print success message with archive path
- [x] T006 [US1] Add error handling to `Makefile` `backup` target: if `bun run scripts/backup-db.ts` fails, clean up `backups/.tmp/` and exit with non-zero code; if `zip` fails (including disk-full), clean up temp dir and any partial zip file to avoid corrupt artifacts

**Checkpoint**: `make backup` produces a timestamped zip in `backups/` with all 3 JSON files, no temp files remain

---

## Phase 4: User Story 2 — Verify Backup Contents (Priority: P2)

**Goal**: Each JSON file contains all rows from its table with all fields preserved; empty tables produce `[]`

**Independent Test**: Run `make backup`, extract the zip, verify each JSON file parses as a valid array and row counts match database

### Implementation for User Story 2

- [x] T007 [US2] In `scripts/backup-db.ts`, add row count logging after each table export (e.g., `Exported 16 rows from FastingSession`) so the developer can visually verify completeness
- [x] T008 [US2] In `scripts/backup-db.ts`, ensure empty tables produce `[]` (verify `findMany()` on an empty table writes an empty JSON array, not `null` or missing file)

**Checkpoint**: Running `make backup` prints per-table row counts; extracted JSON files contain valid arrays matching database contents

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [x] T009 Run `make backup` end-to-end and verify: zip exists in `backups/`, contains 3 JSON files, no temp files remain, `.gitignore` excludes `backups/`, completes in under 30 seconds (SC-003)
- [x] T010 Validate quickstart.md instructions match actual usage in `specs/014-db-backup/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001 (scripts/ directory)
- **User Story 1 (Phase 3)**: Depends on T004 (export script)
- **User Story 2 (Phase 4)**: Depends on T004 (export script); can run in parallel with US1 (US1 edits `Makefile`, US2 edits `scripts/backup-db.ts` — no file conflicts)
- **Polish (Phase 5)**: Depends on all previous phases

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational only — no dependency on US2
- **User Story 2 (P2)**: Depends on Foundational only — no dependency on US1

### Parallel Opportunities

- T002 and T003 can run in parallel (different files)
- US1 and US2 implementation can proceed in parallel after Foundational phase

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004)
3. Complete Phase 3: User Story 1 (T005–T006)
4. **STOP and VALIDATE**: Run `make backup`, inspect zip contents
5. This alone delivers a fully working backup command

### Incremental Delivery

1. Setup + Foundational → Export script works standalone
2. Add User Story 1 → Full Makefile workflow (MVP!)
3. Add User Story 2 → Row count logging for verification confidence
4. Polish → End-to-end validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Commit after each phase completion
- The export script uses the existing Prisma singleton from `src/lib/prisma.ts` which loads `.env.local`
