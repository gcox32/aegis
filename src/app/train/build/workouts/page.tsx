import WorkoutList from '@/components/train/build/workouts/WorkoutList';
import PageLayout from '@/components/layout/PageLayout';

export default function WorkoutsPage() {
  return (
    <PageLayout
      breadcrumbHref="/train/build"
      breadcrumbText="Build"
      title="Workouts"
    >
      <WorkoutList />
    </PageLayout>
  );
}
