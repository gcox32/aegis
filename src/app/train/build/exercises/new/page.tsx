import ExerciseForm from '@/components/train/build/exercises/ExerciseForm';
import PageLayout from '@/components/layout/PageLayout';

export default function NewExercisePage() {
  return (
    <PageLayout
      breadcrumbHref="/train/build/exercises"
      breadcrumbText="Exercises"
    >
      <ExerciseForm />
    </PageLayout>
  );
}
