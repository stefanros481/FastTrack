# Implementation Plan: Database Backup

**Branch**: `014-db-backup` | **Date**: 2026-03-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/014-db-backup/spec.md`

## Summary

Create a Makefile with a `backup` target that exports all database tables (User, FastingSession, UserSettings) as JSON using a TypeScript script via Prisma, compresses them into a timestamped zip archive, and stores it in a gitignored `backups/` folder. Temporary JSON files are cleaned up after zipping.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 18+ (backup script), GNU Make (orchestration)
**Primary Dependencies**: Prisma 7 (existing ORM), `bun` (script runner)
**Storage**: Vercel Postgres (PostgreSQL) — read-only access for backup
**Testing**: Manual verification (run `make backup`, inspect zip contents)
**Target Platform**: macOS (local developer machine)
**Project Type**: Developer tooling (Makefile + script)
**Performance Goals**: Complete in under 30 seconds for hundreds of rows
**Constraints**: Must use existing Prisma client and database connection from `.env.local`
**Scale/Scope**: 3 tables, ~50 rows total currently

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applicability | Status |
|-----------|--------------|--------|
| I. Mobile-First UX | **N/A** — no UI involved; developer CLI tool | PASS |
| II. Security by Default | **Partial** — script accesses database; must use existing authenticated connection. No new public endpoints. Backup files contain user data and must be gitignored. | PASS |
| III. Server-First Architecture | **N/A** — not a user-facing feature; standalone script | PASS |
| IV. Data Integrity & Validation | **N/A** — read-only export; no mutations | PASS |
| V. Premium Simplicity | **N/A** — no UI; scope is bounded to backup only | PASS |

No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/014-db-backup/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
Makefile                 # NEW — backup target
scripts/
└── backup-db.ts         # NEW — Prisma-based JSON export script
backups/                 # NEW — gitignored output directory
.gitignore               # MODIFIED — add backups/ entry
```

**Structure Decision**: Single backup script in a `scripts/` directory at project root. No contracts directory needed — this is a purely internal developer tool with no external interfaces.
