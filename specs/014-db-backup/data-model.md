# Data Model: Database Backup

No schema changes required. This feature reads existing tables in read-only mode.

## Exported Tables

| Table | Prisma Model | Export File |
|-------|-------------|-------------|
| User | `prisma.user` | `User.json` |
| FastingSession | `prisma.fastingSession` | `FastingSession.json` |
| UserSettings | `prisma.userSettings` | `UserSettings.json` |

## Output Artifacts

| Artifact | Location | Format |
|----------|----------|--------|
| Backup archive | `backups/backup-YYYY-MM-DD_HH-MM-SS.zip` | ZIP containing 3 JSON files |
| Temp export dir | `backups/.tmp/` | Transient; deleted after zip creation |

## JSON Format

Each JSON file contains a top-level array of all rows from the table, pretty-printed with 2-space indentation. All fields are included as returned by Prisma's `findMany()` (no field filtering).

Example structure:
```json
[
  { "id": "...", "field1": "...", "field2": "..." },
  { "id": "...", "field1": "...", "field2": "..." }
]
```

Empty tables produce `[]`.
