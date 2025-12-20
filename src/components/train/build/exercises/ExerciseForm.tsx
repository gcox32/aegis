'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FormCard, FormTitle
} from '@/components/ui/Form';
import { CreateEditForm } from '@/components/ui/CreateEditForm';
import { Exercise } from '@/types/train';
import { MUSCLE_GROUPS } from '@/components/anatomy/MuscleGroupSelect';
import { defaultWorkPowerConstants } from './options';
import { ExerciseFormData } from './types';
import { ExerciseFormFields } from './ExerciseFormFields';

interface ExerciseFormProps {
  initialData?: Exercise;
  isEditing?: boolean;
}

export default function ExerciseForm({ initialData, isEditing = false }: ExerciseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ExerciseFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    movementPattern: initialData?.movementPattern || 'other',
    muscleGroups: initialData?.muscleGroups || { primary: '' },
    planeOfMotion: initialData?.planeOfMotion || 'sagittal',
    bilateral: initialData?.bilateral ?? true,
    equipment: initialData?.equipment || [],
    imageUrl: initialData?.imageUrl || '',
    videoUrl: initialData?.videoUrl || '',
    workPowerConstants: initialData?.workPowerConstants || defaultWorkPowerConstants,
    difficulty: initialData?.difficulty || 'beginner',
    parentExerciseId: initialData?.parentExerciseId || undefined,
  });

  // Initialize defaults
  useEffect(() => {
    // Set default primary muscle group if none selected
    if (!formData.muscleGroups.primary && MUSCLE_GROUPS.length > 0) {
      setFormData(prev => ({
        ...prev,
        muscleGroups: { ...prev.muscleGroups, primary: MUSCLE_GROUPS[0] }
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    if (!initialData?.id) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/train/exercises/${initialData.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete exercise');
      router.push('/train/build/exercises');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEditing && initialData
        ? `/api/train/exercises/${initialData.id}`
        : '/api/train/exercises';

      const method = isEditing ? 'PATCH' : 'POST';

      const submissionData = {
        ...formData,
        parentExerciseId: formData.parentExerciseId || undefined
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save exercise');
      }

      router.push('/train/build/exercises');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CreateEditForm
      isEditing={isEditing}
      loading={loading}
      entityName="Exercise"
      handleSubmit={handleSubmit}
      onDelete={handleDelete}
    >
      <FormCard>
        <FormTitle>{isEditing ? 'Edit Exercise' : 'New Exercise'}</FormTitle>

        {error && (
          <div className="bg-red-500/10 p-3 border border-red-500/20 rounded-md text-red-500 text-sm">
            {error}
          </div>
        )}

        <ExerciseFormFields
          formData={formData}
          setFormData={setFormData}
          isEditing={isEditing}
          initialData={initialData}
        />
      </FormCard>
    </CreateEditForm>
  );
}
