import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormCard, FormInput, FormSelect, FormLabel } from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import { TogglePill } from '@/components/ui/TogglePill';
import { Trash, Plus, GripVertical } from 'lucide-react';
import { BLOCK_TYPES } from './options';
import { CreateWorkoutBlockInput, CreateWorkoutBlockExerciseInput } from '@/lib/db/crud/train';
import { SortableExerciseRow } from './SortableExerciseRow';
import { BlockFormData, ScoringType } from './types';

interface SortableWorkoutBlockProps {
  block: BlockFormData;
  blockIndex: number;
  removeBlock: (index: number) => void;
  updateBlock: (index: number, updates: Partial<CreateWorkoutBlockInput>) => void;
  addExercise: (blockIndex: number) => void;
  removeExercise: (blockIndex: number, exerciseIndex: number) => void;
  updateExercise: (blockIndex: number, exerciseIndex: number, updates: Partial<CreateWorkoutBlockExerciseInput>) => void;
  handleScoringTypeChange: (blockIndex: number, exerciseIndex: number, measureType: ScoringType) => void;
  getActiveMeasure: (blockIndex: number, exerciseIndex: number) => ScoringType;
}

export function SortableWorkoutBlock({
  block,
  blockIndex,
  removeBlock,
  updateBlock,
  addExercise,
  removeExercise,
  updateExercise,
  handleScoringTypeChange,
  getActiveMeasure,
}: SortableWorkoutBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.clientId });

  const style = {
    transform: CSS.Transform.toString(transform ? { ...transform, x: 0 } : null),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <FormCard>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center mt-3 mr-2 cursor-grab touch-none" {...attributes} {...listeners}>
            <GripVertical className="text-muted-foreground w-5 h-5" />
          </div>
          <div className="flex-1 gap-4 grid grid-cols-1 sm:grid-cols-2 mr-4">
            <FormInput 
              value={block.name || ''} 
              onChange={e => updateBlock(blockIndex, { name: e.target.value })}
              placeholder="Block Name"
              className="border-transparent focus:border-brand-primary font-bold text-lg"
            />
            <FormSelect
              value={block.workoutBlockType}
              onChange={e => updateBlock(blockIndex, { workoutBlockType: e.target.value as any })}
            >
              {BLOCK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </FormSelect>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => removeBlock(blockIndex)} className="hover:bg-red-500/10 text-red-500 hover:text-red-700">
            <Trash className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex flex-col items-start space-y-1 mb-3 px-1 text-muted-foreground text-xs">
          <FormLabel>Block Style</FormLabel>
          <TogglePill
            leftLabel="Circuit"
            rightLabel="Straight Sets"
            value={block.circuit ?? false}
            onChange={(val) =>
              updateBlock(blockIndex, { circuit: val })
            }
          />
        </div>

        <div className="space-y-3 pl-2 border-border border-l-2">
          <SortableContext 
            items={block.exercises.map(e => e.clientId)} 
            strategy={verticalListSortingStrategy}
          >
            {block.exercises.map((exercise, exerciseIndex) => (
              <SortableExerciseRow
                key={exercise.clientId}
                exercise={exercise}
                blockIndex={blockIndex}
                exerciseIndex={exerciseIndex}
                updateExercise={updateExercise}
                removeExercise={removeExercise}
                handleScoringTypeChange={handleScoringTypeChange}
                activeMeasure={exercise.scoringType}
              />
            ))}
          </SortableContext>
          <Button type="button" variant="secondary" size="sm" onClick={() => addExercise(blockIndex)} fullWidth>
            <Plus className="mr-2 w-4 h-4" /> Add Exercise
          </Button>
        </div>
      </FormCard>
    </div>
  );
}
