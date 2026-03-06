# Research: Gamification Settings & Opt-In

## R1: Nullable Boolean for Tri-State Preference

**Decision**: Use `Boolean?` (nullable) in Prisma schema for `gamificationEnabled`
**Rationale**: Prisma natively supports nullable booleans mapping to PostgreSQL `BOOLEAN NULL`. Three states (null/true/false) cleanly map to undecided/opted-in/opted-out without introducing enums or extra tables.
**Alternatives considered**:
- String enum ("undecided"/"enabled"/"disabled") -- adds unnecessary complexity for 3 states
- Separate `hasSeenGamificationSplash` boolean -- requires two fields instead of one

## R2: Server Action Pattern for Settings

**Decision**: Extend existing `src/app/actions/settings.ts` with `getGamificationSettings()` and `updateGamificationSettings()` following the established `getUserId()` + `prisma.userSettings.update()` pattern.
**Rationale**: Consistent with 6 existing server actions in the same file. No new patterns to introduce.
**Alternatives considered**:
- Separate `src/app/actions/gamification.ts` file -- unnecessary fragmentation for 2 functions

## R3: Splash Screen Rendering Approach

**Decision**: Render `GamificationOptIn` as a fixed overlay inside `FastingTimer` when `gamificationEnabled === null`. Use optimistic state update to dismiss immediately on choice.
**Rationale**: The timer view is the primary view users see. Rendering as an overlay within the existing component avoids route changes. Optimistic update prevents UI lag while the server action completes.
**Alternatives considered**:
- Separate route/page for opt-in -- breaks single-page timer UX
- localStorage-only storage -- doesn't persist across devices, inconsistent with server-side settings pattern

## R4: Settings Page Community Section Behavior When Undecided

**Decision**: When `gamificationEnabled` is null, show the Community section with the master toggle in the "off" position. Turning it on sets `gamificationEnabled` to `true` and also prevents the splash from appearing.
**Rationale**: Users who go to Settings before seeing the splash should still be able to discover and enable gamification. Treating null as "off" for display purposes is intuitive.
**Alternatives considered**:
- Hide Community section entirely when undecided -- forces users through splash as only opt-in path, reducing flexibility

## R5: Default State for Individual Feature Toggles

**Decision**: All 4 feature toggles default to `true` (enabled) in the database. When a user opts in, all features are available immediately.
**Rationale**: Opt-in implies interest in all features. Users can selectively disable features afterward. This maximizes initial engagement.
**Alternatives considered**:
- Default to false, require explicit enabling -- adds friction after already opting in
