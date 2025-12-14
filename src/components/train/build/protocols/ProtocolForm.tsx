'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { 
  FormWrapper, FormCard, FormTitle, FormGroup, FormLabel, 
  FormInput, FormTextarea, FormSelect, FormActions 
} from '@/components/ui/Form';
import { Protocol, Workout } from '@/types/train';
import { Trash, Plus } from 'lucide-react';

interface ProtocolFormProps {
    initialData?: Protocol;
    initialWorkouts?: string[];
    isEditing?: boolean;
}

export default function ProtocolForm({ initialData, initialWorkouts = [], isEditing = false }: ProtocolFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [daysPerWeek, setDaysPerWeek] = useState(initialData?.daysPerWeek || 3);
  const [durationValue, setDurationValue] = useState(initialData?.duration.value || 4);
  const [durationUnit, setDurationUnit] = useState<'weeks' | 'months'>(initialData?.duration.unit as 'weeks' | 'months' || 'weeks');
  const [objectives, setObjectives] = useState<string>(initialData?.objectives.join(', ') || '');
  
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>(initialWorkouts);

  useEffect(() => {
    fetch('/api/train/workouts')
      .then(res => res.json())
      .then(data => setWorkouts(data.workouts))
      .catch(err => console.error(err));
  }, []);

  const addWorkout = () => {
    if (workouts.length > 0) {
        setSelectedWorkouts([...selectedWorkouts, workouts[0].id]);
    }
  };

  const removeWorkout = (index: number) => {
    setSelectedWorkouts(selectedWorkouts.filter((_, i) => i !== index));
  };

  const updateWorkoutSelection = (index: number, workoutId: string) => {
    const newSelection = [...selectedWorkouts];
    newSelection[index] = workoutId;
    setSelectedWorkouts(newSelection);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const protocolData = {
      name,
      description,
      daysPerWeek,
      duration: { value: durationValue, unit: durationUnit },
      objectives: objectives.split(',').map(s => s.trim()).filter(Boolean),
      includes2ADays: false,
      notes: '',
    };

    try {
      const url = isEditing && initialData 
        ? `/api/train/protocols/${initialData.id}` 
        : '/api/train/protocols';
      
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(protocolData),
      });

      if (!res.ok) throw new Error('Failed to save protocol');
      
      const { protocol } = await res.json();

      await fetch(`/api/train/protocols/${protocol.id}/workouts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workoutIds: selectedWorkouts })
        });

      router.push('/train/build/protocols');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to save protocol');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormWrapper>
        <FormCard>
          <FormTitle>Protocol Details</FormTitle>
          
          <FormGroup>
            <FormLabel>Name</FormLabel>
            <FormInput 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </FormGroup>

          <FormGroup>
              <FormLabel>Description</FormLabel>
              <FormTextarea 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
          </FormGroup>

          <div className="grid grid-cols-2 gap-4">
               <FormGroup>
                  <FormLabel>Duration Value</FormLabel>
                  <FormInput 
                      type="number" 
                      value={durationValue} 
                      onChange={e => setDurationValue(parseInt(e.target.value))}
                  />
               </FormGroup>
               <FormGroup>
                  <FormLabel>Duration Unit</FormLabel>
                  <FormSelect
                      value={durationUnit}
                      onChange={e => setDurationUnit(e.target.value as any)}
                  >
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                  </FormSelect>
               </FormGroup>
          </div>

          <FormGroup>
              <FormLabel>Days Per Week</FormLabel>
              <FormInput 
                  type="number" 
                  value={daysPerWeek} 
                  onChange={e => setDaysPerWeek(parseInt(e.target.value))}
              />
          </FormGroup>

          <FormGroup>
              <FormLabel>Objectives (comma separated)</FormLabel>
              <FormInput 
                  type="text" 
                  value={objectives} 
                  onChange={e => setObjectives(e.target.value)}
                  placeholder="Strength, Hypertrophy, etc."
              />
          </FormGroup>
        </FormCard>

        <FormCard>
            <FormTitle>Workouts Sequence</FormTitle>
            <p className="text-sm text-muted-foreground">Add workouts in the order they should be performed.</p>
            
            <div className="space-y-2">
                {selectedWorkouts.map((workoutId, index) => (
                    <div key={index} className="flex gap-2">
                        <FormSelect
                            className="flex-1"
                            value={workoutId}
                            onChange={e => updateWorkoutSelection(index, e.target.value)}
                        >
                            {workouts.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </FormSelect>
                        <Button type="button" variant="ghost" onClick={() => removeWorkout(index)} className="text-red-500 hover:text-red-700 hover:bg-red-500/10">
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
            
            <Button type="button" variant="outline" onClick={addWorkout} fullWidth>
                <Plus className="h-4 w-4 mr-2" /> Add Workout
            </Button>
        </FormCard>

        <FormActions>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
          </Button>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Protocol' : 'Create Protocol'}
          </Button>
        </FormActions>
      </FormWrapper>
    </form>
  );
}
