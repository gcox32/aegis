import { CreateWorkoutBlockInput, CreateWorkoutBlockExerciseInput } from '@/lib/db/crud/train';
import { ScoringType } from '@/types/train';

export interface ExerciseFormData extends CreateWorkoutBlockExerciseInput {
  clientId: string;
}

export interface BlockFormData extends Omit<CreateWorkoutBlockInput, 'exercises'> {
  clientId: string;
  exercises: ExerciseFormData[];
}

export { type ScoringType };
