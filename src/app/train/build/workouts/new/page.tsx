import WorkoutForm from '@/components/train/build/workouts/WorkoutForm';
import PageLayout from '@/components/layout/PageLayout';

export default function NewWorkoutPage() {
  return (
    <PageLayout
      breadcrumbHref="/train/build/workouts"
      breadcrumbText="Workouts"
      title="Create New Workout"
      subtitle="Design a workout by adding blocks and exercises."
    >
      <WorkoutForm />
    </PageLayout>
  );
}
