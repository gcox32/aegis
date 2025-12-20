import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CreateWorkoutBlockExerciseInput } from '@/lib/db/crud/train';
import { ScoringType, ExerciseFormData } from './types';
import { ExerciseRowHeader } from './exercise-row/ExerciseRowHeader';
import { ExerciseRowPrescription } from './exercise-row/ExerciseRowPrescription';
import { ExerciseRowSettings } from './exercise-row/ExerciseRowSettings';

interface SortableExerciseRowProps {
  exercise: ExerciseFormData;
  blockIndex: number;
  exerciseIndex: number;
  updateExercise: (blockIndex: number, exerciseIndex: number, updates: Partial<CreateWorkoutBlockExerciseInput>) => void;
  removeExercise: (blockIndex: number, exerciseIndex: number) => void;
  handleScoringTypeChange: (blockIndex: number, exerciseIndex: number, measureType: ScoringType) => void;
  activeMeasure: ScoringType;
}

export function SortableExerciseRow({
  exercise,
  blockIndex,
  exerciseIndex,
  updateExercise,
  removeExercise,
  handleScoringTypeChange,
  activeMeasure,
}: SortableExerciseRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.clientId });

  const style = {
    transform: CSS.Transform.toString(transform ? { ...transform, x: 0 } : null),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-3 bg-background/50 py-4 px-2 border border-border rounded-lg">
      <ExerciseRowHeader
        exercise={exercise}
        blockIndex={blockIndex}
        exerciseIndex={exerciseIndex}
        updateExercise={updateExercise}
        removeExercise={removeExercise}
        dragAttributes={attributes}
        dragListeners={listeners}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start border-t border-border/50 pt-3">
        <ExerciseRowPrescription
          exercise={exercise}
          blockIndex={blockIndex}
          exerciseIndex={exerciseIndex}
          updateExercise={updateExercise}
        />

        <ExerciseRowSettings
          exercise={exercise}
          blockIndex={blockIndex}
          exerciseIndex={exerciseIndex}
          updateExercise={updateExercise}
          activeMeasure={activeMeasure}
          handleScoringTypeChange={handleScoringTypeChange}
        />
      </div>
    </div>
  );
}
