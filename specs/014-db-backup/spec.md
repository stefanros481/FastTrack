# Feature Specification: Database Backup

**Feature Branch**: `014-db-backup`
**Created**: 2026-03-04
**Status**: Draft
**Input**: User description: "We need to create a small script that backup the database into a local backup folder. The Makefile should download the database tables as json, zip the files and name the zip file a timestamp and store in the backup folder."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run Full Database Backup (Priority: P1)

As a developer, I want to run a single command to export all database tables as JSON files, compress them into a timestamped zip archive, and store it locally so I can restore data if something goes wrong.

**Why this priority**: This is the core purpose of the feature — creating a reliable, repeatable backup with one command.

**Independent Test**: Can be fully tested by running the backup command and verifying a timestamped zip file appears in the backup folder containing JSON exports of all tables.

**Acceptance Scenarios**:

1. **Given** a running database with data, **When** the developer runs the backup command, **Then** all database tables are exported as individual JSON files, compressed into a single zip archive named with a timestamp, and stored in the backup folder.
2. **Given** the backup folder does not yet exist, **When** the developer runs the backup command for the first time, **Then** the backup folder is automatically created and the backup completes successfully.
3. **Given** previous backups exist in the backup folder, **When** the developer runs the backup command again, **Then** a new timestamped zip is created alongside existing backups without overwriting them.

---

### User Story 2 - Verify Backup Contents (Priority: P2)

As a developer, I want each JSON export file to contain all rows from its respective table so I can trust the backup is complete and usable for data restoration.

**Why this priority**: A backup is only valuable if its contents are complete and correct.

**Independent Test**: Can be tested by running the backup, extracting the zip, and comparing the row count of each JSON file against the live database.

**Acceptance Scenarios**:

1. **Given** a completed backup, **When** I extract the zip archive, **Then** I find one JSON file per database table, each named after its table.
2. **Given** a table with data, **When** the backup runs, **Then** the corresponding JSON file contains all rows with all fields preserved.
3. **Given** a table with no data, **When** the backup runs, **Then** the corresponding JSON file contains an empty array.

---

### Edge Cases

- What happens when the database connection is unavailable? The backup command should fail with a clear error message and non-zero exit code.
- What happens when the disk is full? The process should fail gracefully without leaving partial/corrupt zip files.
- What happens when two backups are run at the same second? The timestamp format should be precise enough (to the second) to avoid collisions in normal use.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A Makefile target MUST export all database tables (User, FastingSession, UserSettings) as individual JSON files.
- **FR-002**: Each JSON file MUST be named after its table (e.g., `User.json`, `FastingSession.json`, `UserSettings.json`).
- **FR-003**: The JSON files MUST be compressed into a single zip archive.
- **FR-004**: The zip archive MUST be named with a timestamp in the format `backup-YYYY-MM-DD_HH-MM-SS.zip` for clarity and sort-friendliness.
- **FR-005**: The zip archive MUST be stored in a `backups/` folder at the project root.
- **FR-006**: The `backups/` folder MUST be created automatically if it does not exist.
- **FR-007**: The `backups/` folder MUST be excluded from version control (added to `.gitignore`).
- **FR-008**: Temporary JSON files used during export MUST be cleaned up after the zip is created.
- **FR-009**: The backup command MUST exit with a non-zero code if any table export fails.

### Key Entities

- **Backup Archive**: A timestamped zip file containing JSON exports of all database tables, stored in the local `backups/` directory.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Running `make backup` produces a correctly named, timestamped zip archive in the `backups/` folder.
- **SC-002**: The backup archive contains one JSON file per database table, with all rows and fields intact.
- **SC-003**: The entire backup process completes in under 30 seconds for typical data volumes (hundreds of rows).
- **SC-004**: No temporary files remain after a successful backup.
