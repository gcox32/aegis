import React from 'react';
import { notFound } from 'next/navigation';
import { getExerciseById } from '@/lib/db/crud/train';
import ExerciseForm from '@/components/train/build/exercises/ExerciseForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExercisePage({ params }: PageProps) {
  const { id } = await params;
  const exercise = await getExerciseById(id);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ExerciseForm initialData={exercise} isEditing />
    </div>
  );
}

