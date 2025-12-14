import { db } from '../index';
import { muscleGroup } from '../schema/anatomy';

export async function getMuscleGroups() {
  return await db.select().from(muscleGroup).orderBy(muscleGroup.name);
}

