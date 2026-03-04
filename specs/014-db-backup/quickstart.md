# Quickstart: Database Backup

## Usage

```bash
make backup
```

This exports all database tables as JSON, compresses them into a timestamped zip, and stores it in `backups/`.

## Prerequisites

- `.env.local` with valid `DATABASE_URL_UNPOOLED` connection string
- `bun` installed (project package manager)
- `zip` available (included on macOS by default)

## Output

After running, you'll find:
```
backups/backup-2026-03-04_14-30-00.zip
```

Extract to inspect:
```bash
unzip -l backups/backup-2026-03-04_14-30-00.zip
# User.json
# FastingSession.json
# UserSettings.json
```

## Files Created

| File | Purpose |
|------|---------|
| `Makefile` | Orchestrates backup: runs export script, zips, cleans up |
| `scripts/backup-db.ts` | TypeScript script that exports all Prisma tables to JSON |
| `backups/` | Gitignored output directory for backup archives |
