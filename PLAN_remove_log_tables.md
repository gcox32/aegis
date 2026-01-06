# Implementation Plan: Remove Redundant *-Log Tables

## Overview
Remove all redundant *-log intermediary tables that serve no purpose beyond linking records to users. All log tables are 1:1 with users and contain no metadata, making them unnecessary complexity.

## Goals
1. Simplify database schema by removing 5 log tables
2. Reduce query complexity (eliminate getOrCreate*Log calls)
3. Remove redundant foreign key relationships
4. Follow the precedent set by migration 025 (removed projected_1rm_log)

---

## Tables to Modify

### Category A: Add user_id, Remove Log Table
These tables currently have NO user_id field and rely entirely on the log table for user association.

**Tables:**
- `user_stats_log` + `user_stats`
- `user_image_log` + `user_image`

### Category B: Remove Log Table and Log FK
These tables ALREADY have user_id but redundantly also reference the log table.

**Tables:**
- `water_intake_log` + `water_intake` (has both waterIntakeLogId AND userId)
- `sleep_log` + `sleep_instance` (has both sleepLogId AND userId)

### Category C: Delete Entirely (Unused)
These tables are completely unused - performance metrics are stored at workout-instance level.

**Tables:**
- `performance_log` + `performance`

---

## Detailed Implementation Plan

## 1. Performance Log (COMPLETE DELETION)

**Status:** Completely unused - safe to delete entirely

### Database Changes
```sql
-- Migration: Drop both tables
DROP TABLE IF EXISTS train.performance;
DROP TABLE IF EXISTS train.performance_log;
```

### Code Changes
**Files to modify:**
- `src/lib/db/schema/train.ts`
  - Remove `performanceLog` table definition
  - Remove `performance` table definition
  - Remove from schema exports

- `src/lib/db/crud/train.ts`
  - Remove `getOrCreatePerformanceLog()`
  - Remove `addPerformance()`
  - Remove `getUserPerformances()`
  - Remove `updatePerformance()`
  - Remove `deletePerformance()`

- `src/types/train.ts`
  - Remove `Performance` type
  - Remove `PerformanceLog` type
  - Remove `NewPerformance` type

### Testing
- Verify no imports or references to performance in codebase
- Confirm performance data exists at workout-instance level

---

## 2. User Stats Log

**Current Structure:**
```
user_stats_log (1:1 with user)
  └─ user_stats (references statsLogId, NO user_id)
```

**Target Structure:**
```
user_stats (directly references user_id)
```

### Database Changes
```sql
-- Migration steps:
-- 1. Add user_id column to user_stats
ALTER TABLE public.user_stats
  ADD COLUMN user_id UUID;

-- 2. Populate user_id from the log table
UPDATE public.user_stats us
  SET user_id = (
    SELECT usl.user_id
    FROM public.user_stats_log usl
    WHERE usl.id = us.stats_log_id
  );

-- 3. Make user_id NOT NULL and add FK constraint
ALTER TABLE public.user_stats
  ALTER COLUMN user_id SET NOT NULL,
  ADD CONSTRAINT user_stats_user_id_fk
    FOREIGN KEY (user_id) REFERENCES public.user(id);

-- 4. Drop the stats_log_id column
ALTER TABLE public.user_stats
  DROP COLUMN stats_log_id;

-- 5. Drop the log table
DROP TABLE public.user_stats_log;
```

### Schema Changes
**File:** `src/lib/db/schema/user.ts`

**Remove:**
```typescript
export const userStatsLog = pgTable('user_stats_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => user.id),
});
```

**Update:**
```typescript
export const userStats = pgTable('user_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  // REMOVE: statsLogId: uuid('stats_log_id').notNull().references(() => userStatsLog.id),
  userId: uuid('user_id').notNull().references(() => user.id), // ADD
  height: jsonb('height'),
  weight: jsonb('weight'),
  bodyFatPercentage: numeric('body_fat_percentage', { precision: 5, scale: 2 }),
  muscleMass: jsonb('muscle_mass'),
  armLength: jsonb('arm_length'),
  legLength: jsonb('leg_length'),
  date: date('date').notNull(),
});
```

### Type Changes
**File:** `src/types/user.ts`

**Remove:**
```typescript
export type UserStatsLog = typeof userStatsLog.$inferSelect;
export type NewUserStatsLog = typeof userStatsLog.$inferInsert;
```

**Update:**
```typescript
export type UserStats = typeof userStats.$inferSelect;
export type NewUserStats = typeof userStats.$inferInsert;
// Ensure userId is in the type (should be automatic)
```

### CRUD Changes
**File:** `src/lib/db/crud/user.ts`

**Remove function:**
```typescript
export async function getOrCreateUserStatsLog(userId: string): Promise<string> { ... }
```

**Update function:**
```typescript
export async function createUserStats(
  userId: string,
  statsData: {
    height?: { value: number; unit: string };
    weight?: { value: number; unit: string };
    bodyFatPercentage?: number;
    muscleMass?: { value: number; unit: string };
    armLength?: { value: number; unit: string };
    legLength?: { value: number; unit: string };
    date: string;
  }
): Promise<UserStats> {
  // REMOVE: const statsLogId = await getOrCreateUserStatsLog(userId);

  const newStats = await db
    .insert(userStats)
    .values({
      userId, // CHANGE: from statsLogId to userId
      height: statsData.height,
      weight: statsData.weight,
      bodyFatPercentage: statsData.bodyFatPercentage?.toString(),
      muscleMass: statsData.muscleMass,
      armLength: statsData.armLength,
      legLength: statsData.legLength,
      date: statsData.date,
    })
    .returning();

  return newStats[0];
}
```

**Update function:**
```typescript
export async function getUserStats(userId: string): Promise<UserStats[]> {
  // REMOVE: const log = await getOrCreateUserStatsLog(userId);

  return await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId)) // CHANGE: from statsLogId to userId
    .orderBy(desc(userStats.date));
}
```

**Similar updates needed for:**
- `updateUserStats()`
- `deleteUserStats()`

### UI/Component Changes
Search for usage of user stats in components and verify queries still work.

**Potential files:**
- Any stats form/display components
- Dashboard/profile pages showing stats history

---

## 3. User Image Log

**Current Structure:**
```
user_image_log (1:1 with user)
  └─ user_image (references imageLogId, NO user_id)
```

**Target Structure:**
```
user_image (directly references user_id)
```

### Database Changes
```sql
-- Migration steps:
-- 1. Add user_id column to user_image
ALTER TABLE public.user_image
  ADD COLUMN user_id UUID;

-- 2. Populate user_id from the log table
UPDATE public.user_image ui
  SET user_id = (
    SELECT uil.user_id
    FROM public.user_image_log uil
    WHERE uil.id = ui.image_log_id
  );

-- 3. Make user_id NOT NULL and add FK constraint
ALTER TABLE public.user_image
  ALTER COLUMN user_id SET NOT NULL,
  ADD CONSTRAINT user_image_user_id_fk
    FOREIGN KEY (user_id) REFERENCES public.user(id);

-- 4. Drop the image_log_id column
ALTER TABLE public.user_image
  DROP COLUMN image_log_id;

-- 5. Drop the log table
DROP TABLE public.user_image_log;
```

### Schema Changes
**File:** `src/lib/db/schema/user.ts`

**Remove:**
```typescript
export const userImageLog = pgTable('user_image_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => user.id),
});
```

**Update:**
```typescript
export const userImage = pgTable('user_image', {
  id: uuid('id').defaultRandom().primaryKey(),
  // REMOVE: imageLogId: uuid('image_log_id').notNull().references(() => userImageLog.id),
  userId: uuid('user_id').notNull().references(() => user.id), // ADD
  date: date('date').notNull(),
  imageUrl: text('image_url').notNull(),
  notes: text('notes'),
});
```

### Type Changes
**File:** `src/types/user.ts`

**Remove:**
```typescript
export type UserImageLog = typeof userImageLog.$inferSelect;
export type NewUserImageLog = typeof userImageLog.$inferInsert;
```

### CRUD Changes
**File:** `src/lib/db/crud/user.ts`

**Remove function:**
```typescript
export async function getOrCreateUserImageLog(userId: string): Promise<string> { ... }
```

**Update createUserImage:**
```typescript
export async function createUserImage(
  userId: string,
  imageData: { date: string; imageUrl: string; notes?: string }
): Promise<UserImage> {
  // REMOVE: const imageLogId = await getOrCreateUserImageLog(userId);

  const newImage = await db
    .insert(userImage)
    .values({
      userId, // CHANGE: from imageLogId to userId
      date: imageData.date,
      imageUrl: imageData.imageUrl,
      notes: imageData.notes,
    })
    .returning();

  return newImage[0];
}
```

**Update getUserImages:**
```typescript
export async function getUserImages(userId: string): Promise<UserImage[]> {
  // REMOVE: const log = await getOrCreateUserImageLog(userId);

  return await db
    .select()
    .from(userImage)
    .where(eq(userImage.userId, userId)) // CHANGE: from imageLogId to userId
    .orderBy(desc(userImage.date));
}
```

**Similar updates for:**
- `updateUserImage()`
- `deleteUserImage()`

---

## 4. Water Intake Log

**Current Structure:**
```
water_intake_log (1:1 with user)
  └─ water_intake (references waterIntakeLogId AND userId - REDUNDANT)
```

**Target Structure:**
```
water_intake (only references user_id)
```

### Database Changes
```sql
-- Migration steps:
-- 1. Drop the FK constraint to log table
ALTER TABLE fuel.water_intake
  DROP CONSTRAINT IF EXISTS water_intake_water_intake_log_id_fkey;

-- 2. Drop the water_intake_log_id column
ALTER TABLE fuel.water_intake
  DROP COLUMN water_intake_log_id;

-- 3. Drop the log table
DROP TABLE fuel.water_intake_log;
```

### Schema Changes
**File:** `src/lib/db/schema/fuel.ts`

**Remove:**
```typescript
export const waterIntakeLog = fuelSchema.table('water_intake_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => user.id),
});
```

**Update:**
```typescript
export const waterIntake = fuelSchema.table('water_intake', {
  id: uuid('id').defaultRandom().primaryKey(),
  // REMOVE: waterIntakeLogId: uuid('water_intake_log_id').notNull().references(() => waterIntakeLog.id),
  userId: uuid('user_id').notNull().references(() => user.id),
  date: date('date').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }),
  amount: jsonb('amount').notNull(),
  notes: text('notes'),
});
```

### Type Changes
**File:** `src/types/fuel.ts`

**Remove:**
```typescript
export type WaterIntakeLog = typeof waterIntakeLog.$inferSelect;
export type NewWaterIntakeLog = typeof waterIntakeLog.$inferInsert;
```

### CRUD Changes
**File:** `src/lib/db/crud/fuel.ts`

**Remove function:**
```typescript
export async function getOrCreateWaterIntakeLog(userId: string): Promise<string> { ... }
```

**Update createWaterIntake:**
```typescript
export async function createWaterIntake(
  userId: string,
  intakeData: {
    date: string;
    timestamp?: Date;
    amount: { value: number; unit: string };
    notes?: string;
  }
): Promise<WaterIntake> {
  // REMOVE: const waterIntakeLogId = await getOrCreateWaterIntakeLog(userId);

  const newIntake = await db
    .insert(waterIntake)
    .values({
      // REMOVE: waterIntakeLogId,
      userId,
      date: intakeData.date,
      timestamp: intakeData.timestamp,
      amount: intakeData.amount,
      notes: intakeData.notes,
    })
    .returning();

  return newIntake[0];
}
```

**Update getUserWaterIntakes:**
```typescript
export async function getUserWaterIntakes(userId: string): Promise<WaterIntake[]> {
  // REMOVE: const waterIntakeLogId = await getOrCreateWaterIntakeLog(userId);

  return await db
    .select()
    .from(waterIntake)
    .where(eq(waterIntake.userId, userId)) // Already using userId, just remove log lookup
    .orderBy(desc(waterIntake.timestamp));
}
```

**Similar updates for:**
- `updateWaterIntake()`
- `deleteWaterIntake()`

---

## 5. Sleep Log

**Current Structure:**
```
sleep_log (1:1 with user)
  └─ sleep_instance (references sleepLogId AND userId - REDUNDANT)
```

**Target Structure:**
```
sleep_instance (only references user_id)
```

### Database Changes
```sql
-- Migration steps:
-- 1. Drop the FK constraint to log table
ALTER TABLE fuel.sleep_instance
  DROP CONSTRAINT IF EXISTS sleep_instance_sleep_log_id_fkey;

-- 2. Drop the sleep_log_id column
ALTER TABLE fuel.sleep_instance
  DROP COLUMN sleep_log_id;

-- 3. Drop the log table
DROP TABLE fuel.sleep_log;
```

### Schema Changes
**File:** `src/lib/db/schema/fuel.ts`

**Remove:**
```typescript
export const sleepLog = fuelSchema.table('sleep_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => user.id),
});
```

**Update:**
```typescript
export const sleepInstance = fuelSchema.table('sleep_instance', {
  id: uuid('id').defaultRandom().primaryKey(),
  // REMOVE: sleepLogId: uuid('sleep_log_id').notNull().references(() => sleepLog.id),
  userId: uuid('user_id').notNull().references(() => user.id),
  date: date('date').notNull(),
  timeAsleep: jsonb('time_asleep').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }),
  endTime: timestamp('end_time', { withTimezone: true }),
  sleepScore: numeric('sleep_score', { precision: 5, scale: 2 }),
  wakeCount: integer('wake_count'),
  timeAwake: jsonb('time_awake'),
  notes: text('notes'),
});
```

### Type Changes
**File:** `src/types/fuel.ts`

**Remove:**
```typescript
export type SleepLog = typeof sleepLog.$inferSelect;
export type NewSleepLog = typeof sleepLog.$inferInsert;
```

### CRUD Changes
**File:** `src/lib/db/crud/fuel.ts`

**Remove function:**
```typescript
export async function getOrCreateSleepLog(userId: string): Promise<string> { ... }
```

**Update createSleepInstance:**
```typescript
export async function createSleepInstance(
  userId: string,
  sleepData: {
    date: string;
    timeAsleep: { hours: number; minutes: number };
    startTime?: Date;
    endTime?: Date;
    sleepScore?: number;
    wakeCount?: number;
    timeAwake?: { hours: number; minutes: number };
    notes?: string;
  }
): Promise<SleepInstance> {
  // REMOVE: const sleepLogId = await getOrCreateSleepLog(userId);

  const newSleep = await db
    .insert(sleepInstance)
    .values({
      // REMOVE: sleepLogId,
      userId,
      date: sleepData.date,
      timeAsleep: sleepData.timeAsleep,
      startTime: sleepData.startTime,
      endTime: sleepData.endTime,
      sleepScore: sleepData.sleepScore?.toString(),
      wakeCount: sleepData.wakeCount,
      timeAwake: sleepData.timeAwake,
      notes: sleepData.notes,
    })
    .returning();

  return newSleep[0];
}
```

**Update getUserSleepInstances:**
```typescript
export async function getUserSleepInstances(userId: string): Promise<SleepInstance[]> {
  // REMOVE: const sleepLogId = await getOrCreateSleepLog(userId);

  return await db
    .select()
    .from(sleepInstance)
    .where(eq(sleepInstance.userId, userId)) // Already using userId, just remove log lookup
    .orderBy(desc(sleepInstance.date));
}
```

**Similar updates for:**
- `updateSleepInstance()`
- `deleteSleepInstance()`

### UI/Component Changes
**File:** `src/components/log/sleep/SleepForm.tsx` (currently modified)

Review this component to ensure it works with the refactored CRUD operations. The component likely calls `createSleepInstance` which will have a different signature.

---

## Migration File Structure

**File:** `src/lib/db/migrations/0XX_remove_log_tables.sql`

```sql
-- Migration: Remove redundant *-log tables
-- This migration removes 5 log tables that serve no purpose beyond linking records to users

-- ============================================================================
-- 1. PERFORMANCE (Complete deletion - unused tables)
-- ============================================================================
DROP TABLE IF EXISTS train.performance;
DROP TABLE IF EXISTS train.performance_log;

-- ============================================================================
-- 2. USER_STATS_LOG (Add user_id to user_stats, remove log)
-- ============================================================================

-- Add user_id column
ALTER TABLE public.user_stats
  ADD COLUMN user_id UUID;

-- Populate from log table
UPDATE public.user_stats us
  SET user_id = (
    SELECT usl.user_id
    FROM public.user_stats_log usl
    WHERE usl.id = us.stats_log_id
  );

-- Make NOT NULL and add FK
ALTER TABLE public.user_stats
  ALTER COLUMN user_id SET NOT NULL,
  ADD CONSTRAINT user_stats_user_id_fk
    FOREIGN KEY (user_id) REFERENCES public.user(id);

-- Drop old column and log table
ALTER TABLE public.user_stats DROP COLUMN stats_log_id;
DROP TABLE public.user_stats_log;

-- ============================================================================
-- 3. USER_IMAGE_LOG (Add user_id to user_image, remove log)
-- ============================================================================

-- Add user_id column
ALTER TABLE public.user_image
  ADD COLUMN user_id UUID;

-- Populate from log table
UPDATE public.user_image ui
  SET user_id = (
    SELECT uil.user_id
    FROM public.user_image_log uil
    WHERE uil.id = ui.image_log_id
  );

-- Make NOT NULL and add FK
ALTER TABLE public.user_image
  ALTER COLUMN user_id SET NOT NULL,
  ADD CONSTRAINT user_image_user_id_fk
    FOREIGN KEY (user_id) REFERENCES public.user(id);

-- Drop old column and log table
ALTER TABLE public.user_image DROP COLUMN image_log_id;
DROP TABLE public.user_image_log;

-- ============================================================================
-- 4. WATER_INTAKE_LOG (Remove log, already has user_id)
-- ============================================================================

-- Drop FK and column
ALTER TABLE fuel.water_intake
  DROP CONSTRAINT IF EXISTS water_intake_water_intake_log_id_fkey,
  DROP COLUMN water_intake_log_id;

-- Drop log table
DROP TABLE fuel.water_intake_log;

-- ============================================================================
-- 5. SLEEP_LOG (Remove log, already has user_id)
-- ============================================================================

-- Drop FK and column
ALTER TABLE fuel.sleep_instance
  DROP CONSTRAINT IF EXISTS sleep_instance_sleep_log_id_fkey,
  DROP COLUMN sleep_log_id;

-- Drop log table
DROP TABLE fuel.sleep_log;
```

---

## Testing Checklist

### Unit Tests
- [ ] User stats CRUD operations work with direct user_id
- [ ] User image CRUD operations work with direct user_id
- [ ] Water intake CRUD operations work without log table
- [ ] Sleep instance CRUD operations work without log table
- [ ] Performance tables are completely removed

### Integration Tests
- [ ] User can create/view/update/delete stats entries
- [ ] User can create/view/update/delete image entries
- [ ] User can create/view/update/delete water intake entries
- [ ] User can create/view/update/delete sleep entries
- [ ] Dashboard/profile pages display all data correctly

### Database Verification
- [ ] All log tables are dropped
- [ ] All child tables have proper user_id FK constraints
- [ ] No orphaned records exist
- [ ] Query performance is maintained or improved
- [ ] Existing data is preserved correctly

### Code Verification
- [ ] No references to removed log types remain
- [ ] No references to getOrCreate*Log functions remain
- [ ] All imports updated
- [ ] TypeScript compiles without errors
- [ ] No dead code remains

---

## Risk Assessment

### Low Risk
- **Performance/Performance Log deletion:** Completely unused, safe to remove
- **Water/Sleep log removal:** Already have user_id, just removing redundancy

### Medium Risk
- **User Stats/Image migration:** Requires data migration, but straightforward
- Schema changes are reversible if caught early

### Mitigation Strategies
1. **Backup database before migration**
2. **Test migration on development/staging first**
3. **Verify data integrity after migration:**
   ```sql
   -- Check all user_stats have valid user_id
   SELECT COUNT(*) FROM public.user_stats WHERE user_id IS NULL;

   -- Check all user_images have valid user_id
   SELECT COUNT(*) FROM public.user_image WHERE user_id IS NULL;
   ```
4. **Can rollback migration if issues found**

---

## Implementation Order

1. **Performance (easiest, no data migration)**
   - Remove schema definitions
   - Remove CRUD operations
   - Remove types
   - Add DROP statements to migration

2. **Water Intake (simple, no data migration)**
   - Update schema (remove log table, remove FK column)
   - Update CRUD operations
   - Remove types
   - Add migration statements

3. **Sleep (simple, no data migration)**
   - Update schema (remove log table, remove FK column)
   - Update CRUD operations
   - Remove types
   - Update UI components (SleepForm.tsx)
   - Add migration statements

4. **User Stats (requires data migration)**
   - Update schema (add user_id, remove log table)
   - Update CRUD operations
   - Update types
   - Add migration statements with data population

5. **User Image (requires data migration)**
   - Update schema (add user_id, remove log table)
   - Update CRUD operations
   - Update types
   - Add migration statements with data population

6. **Final Migration File**
   - Combine all SQL statements
   - Test on development database
   - Verify data integrity

7. **Testing**
   - Run all tests
   - Manual verification of all affected features

---

## Files to Modify Summary

### Schema Files
- `src/lib/db/schema/user.ts` (user_stats_log, user_image_log)
- `src/lib/db/schema/fuel.ts` (water_intake_log, sleep_log)
- `src/lib/db/schema/train.ts` (performance_log, performance)

### CRUD Files
- `src/lib/db/crud/user.ts`
- `src/lib/db/crud/fuel.ts`
- `src/lib/db/crud/train.ts`

### Type Files
- `src/types/user.ts`
- `src/types/fuel.ts`
- `src/types/train.ts`

### Migration Files
- `src/lib/db/migrations/0XX_remove_log_tables.sql` (new)

### UI Components (potential)
- `src/components/log/sleep/SleepForm.tsx` (already modified)
- Any stats display/form components
- Any image upload/display components
- Any water intake components

---

## Success Criteria

- [ ] All 5 log tables removed from database
- [ ] All child tables properly reference user_id
- [ ] All CRUD operations work correctly
- [ ] All UI components function properly
- [ ] No TypeScript errors
- [ ] All tests pass
- [ ] Data integrity maintained
- [ ] Code is cleaner and more maintainable
- [ ] Query complexity reduced (no more getOrCreate calls)
