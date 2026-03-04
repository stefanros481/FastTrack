# Research: Database Backup

## R-001: Script Runner for Database Export

**Decision**: Use `bun` to run a TypeScript script that imports the existing Prisma client singleton.

**Rationale**: The project already uses `bun` as its package manager and script runner (per constitution). The existing `src/lib/prisma.ts` singleton handles connection setup and reads `.env.local`. A simple `bun run scripts/backup-db.ts` avoids any new dependencies.

**Alternatives considered**:
- `psql` + `COPY TO` for raw SQL export — rejected because it requires `psql` installed locally and doesn't produce clean JSON matching Prisma model shapes.
- `prisma db execute` — rejected because it doesn't return result rows, only executes statements.
- Node.js `tsx` runner — viable but `bun` is the project standard.

## R-002: JSON Export Approach

**Decision**: Use `prisma.user.findMany()`, `prisma.fastingSession.findMany()`, `prisma.userSettings.findMany()` and write each result to a separate JSON file with `JSON.stringify(data, null, 2)`.

**Rationale**: Prisma's `findMany()` with no filters returns all rows. Pretty-printed JSON is human-readable for inspection. One file per table matches the spec requirement (FR-002).

**Alternatives considered**:
- Single combined JSON file — rejected because separate files per table are easier to inspect and selectively restore.
- NDJSON format — rejected because standard JSON is simpler and the data volumes are tiny.

## R-003: Zip Archive Creation

**Decision**: Use Node.js built-in `child_process.execSync` to call the system `zip` command, since macOS includes `zip` by default.

**Rationale**: Avoids adding a new npm dependency (like `archiver` or `jszip`). The `zip` command is universally available on macOS and Linux. The Makefile can also handle zipping directly.

**Alternatives considered**:
- `archiver` npm package — viable but unnecessary dependency for a simple 3-file zip.
- Makefile-level `zip` command — **actually preferred**: the script exports JSON files, the Makefile handles zipping and cleanup. This keeps the script focused on data export only.

**Revised decision**: The TypeScript script exports JSON files to a temp directory. The Makefile handles `zip` and cleanup. This is cleaner separation of concerns.

## R-004: Timestamp Format

**Decision**: `backup-YYYY-MM-DD_HH-MM-SS.zip` using local time, generated in the Makefile via `date +%Y-%m-%d_%H-%M-%S`.

**Rationale**: Sort-friendly, human-readable, avoids colons (filesystem-safe). Local time is more intuitive for a personal tool than UTC.

**Alternatives considered**:
- ISO 8601 with colons — rejected because colons are problematic in filenames on some systems.
- Unix epoch — rejected because not human-readable.

## R-005: Temp File Strategy

**Decision**: Export JSON files to a temp directory inside `backups/` (e.g., `backups/.tmp/`), zip from there, then remove the temp directory.

**Rationale**: Keeps temp files contained and easy to clean up. The `.tmp` prefix signals it's transient. If the process fails mid-way, only the temp dir remains (no orphaned files at project root).

**Alternatives considered**:
- System `/tmp` directory — rejected because relative paths in the zip would be wrong.
- Export directly to `backups/` then delete — messier cleanup if multiple JSON files exist.
