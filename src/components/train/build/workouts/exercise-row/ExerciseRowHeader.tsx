import React, { useState } from 'react';
import { ExerciseAutocomplete } from '@/components/train/build/exercises/ExerciseAutocomplete';
import { CreateWorkoutBlockExerciseInput } from '@/lib/db/crud/train';
import { Exercise } from '@/types/train';
import { Trash, GripVertical } from 'lucide-react';
import { ExerciseFormData } from '../types';
import { CreateExerciseOverlay } from '@/components/train/build/exercises/CreateExerciseOverlay';

interface ExerciseRowHeaderProps {
  exercise: ExerciseFormData;
  blockIndex: number;
  exerciseIndex: number;
  updateExercise: (blockIndex: number, exerciseIndex: number, updates: Partial<CreateWorkoutBlockExerciseInput>) => void;
  removeExercise: (blockIndex: number, exerciseIndex: number) => void;
  dragAttributes: any;
  dragListeners: any;
}

export function ExerciseRowHeader({
  exercise,
  blockIndex,
  exerciseIndex,
  updateExercise,
  removeExercise,
  dragAttributes,
  dragListeners,
}: ExerciseRowHeaderProps) {
  const [isCreateOverlayOpen, setIsCreateOverlayOpen] = useState(false);

  const handleExerciseCreated = (newExercise: Exercise) => {
    updateExercise(blockIndex, exerciseIndex, { exerciseId: newExercise.id });
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex items-center cursor-grab touch-none text-muted-foreground hover:text-foreground" {...dragAttributes} {...dragListeners}>
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <ExerciseAutocomplete
            initialExerciseId={exercise.exerciseId || undefined}
            onChange={(selected: Exercise | null) =>
              updateExercise(blockIndex, exerciseIndex, { exerciseId: selected?.id || '' })
            }
            onCreate={() => setIsCreateOverlayOpen(true)}
          />
        </div>
        <button 
          type="button" 
          onClick={() => removeExercise(blockIndex, exerciseIndex)} 
          className="text-muted-foreground hover:text-red-500 transition-colors p-2"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>

      <CreateExerciseOverlay
        isOpen={isCreateOverlayOpen}
        onClose={() => setIsCreateOverlayOpen(false)}
        onSuccess={handleExerciseCreated}
      />
    </>
  );
}
