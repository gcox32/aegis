'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { 
  FormWrapper, FormCard, FormTitle, FormGroup, FormLabel, 
  FormInput, FormTextarea, FormSelect, FormActions 
} from '@/components/ui/Form';
import { Exercise, Workout, WorkoutBlockType, WorkoutType } from '@/types/train';
import { CreateWorkoutInput, CreateWorkoutBlockInput, CreateWorkoutBlockExerciseInput } from '@/lib/db/crud/train';
import { Plus, Trash } from 'lucide-react';

const WORKOUT_TYPES: WorkoutType[] = ['strength', 'hypertrophy', 'endurance', 'power', 'skill', 'other'];
const BLOCK_TYPES: WorkoutBlockType[] = ['warm-up', 'prep', 'main', 'accessory', 'finisher', 'cooldown', 'other'];

interface WorkoutFormProps {
    workoutId?: string;
    isEditing?: boolean;
}

export default function WorkoutForm({ workoutId, isEditing = false }: WorkoutFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [workoutType, setWorkoutType] = useState<WorkoutType>('strength');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(60);
  const [objectives, setObjectives] = useState<string[]>([]);
  
  const [blocks, setBlocks] = useState<CreateWorkoutBlockInput[]>([
    {
      workoutBlockType: 'main',
      name: 'Main Block',
      order: 1,
      circuit: false,
      exercises: [],
    }
  ]);

  useEffect(() => {
    // Fetch available exercises
    fetch('/api/train/exercises')
      .then(res => res.json())
      .then(data => setExercises(data.exercises))
      .catch(err => console.error('Failed to fetch exercises', err));

    // If editing, fetch existing workout (placeholder for now)
    if (isEditing && workoutId) {
        // TODO: Implement fetching full workout details
    }
  }, [isEditing, workoutId]);

  const addBlock = () => {
    setBlocks([
      ...blocks,
      {
        workoutBlockType: 'main',
        name: `Block ${blocks.length + 1}`,
        order: blocks.length + 1,
        circuit: false,
        exercises: [],
      }
    ]);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const updateBlock = (index: number, updates: Partial<CreateWorkoutBlockInput>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    setBlocks(newBlocks);
  };

  const addExercise = (blockIndex: number) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].exercises.push({
      exerciseId: exercises[0]?.id || '',
      order: newBlocks[blockIndex].exercises.length + 1,
      sets: 3,
      measures: { reps: 10 },
      restTime: 60,
    } as any);
    setBlocks(newBlocks);
  };

  const removeExercise = (blockIndex: number, exerciseIndex: number) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].exercises = newBlocks[blockIndex].exercises.filter((_, i) => i !== exerciseIndex);
    setBlocks(newBlocks);
  };

  const updateExercise = (blockIndex: number, exerciseIndex: number, updates: Partial<CreateWorkoutBlockExerciseInput>) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].exercises[exerciseIndex] = { ...newBlocks[blockIndex].exercises[exerciseIndex], ...updates };
    setBlocks(newBlocks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const workoutData: CreateWorkoutInput = {
      name,
      description,
      workoutType,
      estimatedDuration,
      objectives,
      blocks: blocks.map((b, i) => ({
        ...b,
        order: i + 1,
        exercises: b.exercises.map((e, j) => ({
          ...e,
          order: j + 1,
        }))
      }))
    };

    try {
      const url = isEditing ? `/api/train/workouts/${workoutId}` : '/api/train/workouts';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData),
      });

      if (!res.ok) throw new Error('Failed to save workout');

      router.push('/train/build/workouts');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to save workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormWrapper>
        <FormCard>
          <FormTitle>Workout Details</FormTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup>
              <FormLabel>Name</FormLabel>
              <FormInput 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>Type</FormLabel>
              <FormSelect 
                value={workoutType} 
                onChange={e => setWorkoutType(e.target.value as WorkoutType)}
              >
                {WORKOUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </FormSelect>
            </FormGroup>
            <div className="md:col-span-2">
              <FormGroup>
                <FormLabel>Description</FormLabel>
                <FormTextarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                />
              </FormGroup>
            </div>
            <FormGroup>
              <FormLabel>Est. Duration (min)</FormLabel>
              <FormInput 
                type="number" 
                value={estimatedDuration} 
                onChange={e => setEstimatedDuration(parseInt(e.target.value))}
              />
            </FormGroup>
          </div>
        </FormCard>

        <div className="space-y-4">
          {blocks.map((block, blockIndex) => (
            <FormCard key={blockIndex}>
              <div className="flex justify-between items-start mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 mr-4">
                  <FormInput 
                    value={block.name || ''} 
                    onChange={e => updateBlock(blockIndex, { name: e.target.value })}
                    placeholder="Block Name"
                    className="font-bold text-lg border-transparent focus:border-brand-primary"
                  />
                  <FormSelect
                    value={block.workoutBlockType}
                    onChange={e => updateBlock(blockIndex, { workoutBlockType: e.target.value as WorkoutBlockType })}
                  >
                    {BLOCK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </FormSelect>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeBlock(blockIndex)} className="text-red-500 hover:text-red-700 hover:bg-red-500/10">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3 pl-4 border-l-2 border-border">
                {block.exercises.map((exercise, exerciseIndex) => (
                  <div key={exerciseIndex} className="grid grid-cols-12 gap-2 items-center bg-background/50 p-3 rounded border border-border">
                     <div className="col-span-12 sm:col-span-4">
                       <FormSelect
                          value={exercise.exerciseId}
                          onChange={e => updateExercise(blockIndex, exerciseIndex, { exerciseId: e.target.value })}
                       >
                          <option value="">Select Exercise</option>
                          {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                       </FormSelect>
                     </div>
                     <div className="col-span-3 sm:col-span-2">
                        <FormLabel className="text-xs">Sets</FormLabel>
                        <FormInput 
                          type="number" 
                          value={exercise.sets} 
                          onChange={e => updateExercise(blockIndex, exerciseIndex, { sets: parseInt(e.target.value) })}
                          className="px-2 py-1"
                        />
                     </div>
                     <div className="col-span-3 sm:col-span-2">
                        <FormLabel className="text-xs">Reps</FormLabel>
                        <FormInput 
                          type="number" 
                          value={exercise.measures.reps || 0} 
                          onChange={e => updateExercise(blockIndex, exerciseIndex, { measures: { ...exercise.measures, reps: parseInt(e.target.value) } })}
                          className="px-2 py-1"
                        />
                     </div>
                     <div className="col-span-3 sm:col-span-2">
                        <FormLabel className="text-xs">Rest (s)</FormLabel>
                        <FormInput 
                          type="number" 
                          value={exercise.restTime || 0} 
                          onChange={e => updateExercise(blockIndex, exerciseIndex, { restTime: parseInt(e.target.value) as any })}
                          className="px-2 py-1"
                        />
                     </div>
                     <div className="col-span-1 flex justify-end pt-4">
                        <button type="button" onClick={() => removeExercise(blockIndex, exerciseIndex)} className="text-muted-foreground hover:text-red-500">
                          <Trash className="h-4 w-4" />
                        </button>
                     </div>
                  </div>
                ))}
                <Button type="button" variant="secondary" size="sm" onClick={() => addExercise(blockIndex)} fullWidth>
                  <Plus className="h-4 w-4 mr-2" /> Add Exercise
                </Button>
              </div>
            </FormCard>
          ))}
          
          <Button type="button" variant="outline" onClick={addBlock} fullWidth className="py-4 border-dashed border-2">
            <Plus className="h-5 w-5 mr-2" /> Add Workout Block
          </Button>
        </div>

        <FormActions>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
          </Button>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Workout' : 'Create Workout'}
          </Button>
        </FormActions>
      </FormWrapper>
    </form>
  );
}
