# Data Model: User Settings

**No schema changes required** — all entities and fields already exist.

## Existing Entities Used

### User

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| email | String (unique) | Displayed in profile section |
| name | String? | Displayed in profile section; may be null for dev credentials |
| image | String? | Google profile image URL; null for dev credentials |
| createdAt | DateTime | Not displayed |
| updatedAt | DateTime | Not displayed |

**Relationship**: Has one `UserSettings` (1:1)

### UserSettings

| Field | Type | Default | Used By |
|-------|------|---------|---------|
| id | String (cuid) | auto | Internal |
| defaultGoalMinutes | Int? | null | US3: Default fasting goal |
| reminderEnabled | Boolean | false | US5: Daily reminder toggle |
| reminderTime | String? | null | US5: Reminder time (e.g., "08:00") |
| maxDurationMinutes | Int? | null | US5: Max duration alert |
| theme | String | "dark" | US2: Theme preference ("dark", "light", "system") |
| userId | String (unique) | — | Foreign key to User |

**Relationship**: Belongs to one `User` (1:1, cascade delete)

## Validation Rules

- **theme**: Must be one of `"dark"`, `"light"`, `"system"`
- **defaultGoalMinutes**: Must be between 60 (1 hour) and 4320 (72 hours), or null
- **reminderTime**: Must be a valid time string in `HH:MM` format (24-hour), or null
- **maxDurationMinutes**: Must be between 60 (1 hour) and 4320 (72 hours), or null
- **reminderEnabled**: Boolean, no additional validation

## Data Access Patterns

1. **Read profile + settings (page load)**: Fetch `User` (name, email, image) and `UserSettings` (all fields) by `userId` — single query with include or two parallel queries
2. **Update theme**: Write `UserSettings.theme` by `userId`
3. **Update default goal**: Write `UserSettings.defaultGoalMinutes` by `userId` (existing action)
4. **Update reminder settings**: Write `UserSettings.reminderEnabled`, `reminderTime` by `userId`
5. **Update max duration**: Write `UserSettings.maxDurationMinutes` by `userId`
