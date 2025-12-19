import WorkoutForm from '@/components/train/build/workouts/WorkoutForm';
import PageLayout from '@/components/layout/PageLayout';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWorkoutPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <PageLayout
      breadcrumbHref="/train/build/workouts"
      breadcrumbText="Workouts"
      title="Edit Workout"
    >
      <WorkoutForm workoutId={id} isEditing />
    </PageLayout>
  );
}

