import WorkoutInstanceList from '@/components/log/workouts/WorkoutInstanceList';
import PageLayout from '@/components/layout/PageLayout';

export default function LogWorkoutsPage() {
  return (
    <PageLayout
      breadcrumbHref="/log"
      breadcrumbText="Log"
      title="Workout History"
    >
      <WorkoutInstanceList />
    </PageLayout>
  );
}
