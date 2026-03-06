# Data Model: Gamification Settings

## Modified Entity: UserSettings

5 new fields added to the existing `UserSettings` model. No new tables.

### New Fields

| Field | Type | Default | Nullable | Description |
|-------|------|---------|----------|-------------|
| `gamificationEnabled` | Boolean | - | Yes (null) | Tri-state: null = undecided (show splash), true = opted in, false = opted out |
| `gamificationAchievements` | Boolean | true | No | Individual toggle for Achievements/Badges feature |
| `gamificationWhosFasting` | Boolean | true | No | Individual toggle for "Who's Fasting Now" feature |
| `gamificationLeaderboard` | Boolean | true | No | Individual toggle for Group Leaderboard feature |
| `gamificationChallenge` | Boolean | true | No | Individual toggle for Weekly Challenge feature |

### State Transitions

```
gamificationEnabled:
  null (undecided) ──→ true  (via splash "Join In" or Settings toggle on)
  null (undecided) ──→ false (via splash "No Thanks" or Settings toggle stays off)
  true  ←──→ false (via Settings master toggle, reversible at any time)
```

### Validation Rules

- `gamificationEnabled`: accepts null, true, or false
- Feature toggles: boolean only (true/false), never null
- Feature toggles are only meaningful when `gamificationEnabled === true`
- No cross-field validation needed

### Relationship

- One-to-one with `User` (existing relationship, no change)
- No new relationships introduced
