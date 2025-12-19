import { notFound } from 'next/navigation';
import { getExerciseById } from '@/lib/db/crud/train';
import ExerciseForm from '@/components/train/build/exercises/ExerciseForm';
import PageLayout from '@/components/layout/PageLayout';

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
    <PageLayout
      breadcrumbHref="/train/build/exercises"
      breadcrumbText="Exercises"
      title="Edit Exercise"
    >
      <ExerciseForm initialData={exercise} isEditing />
    </PageLayout>
  );
}

