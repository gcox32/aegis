import { Exercise } from '@/types/train';

export type ExerciseFormData = Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>;
