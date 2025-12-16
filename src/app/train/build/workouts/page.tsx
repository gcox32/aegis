import WorkoutList from '@/components/train/build/workouts/WorkoutList';
import BackToLink from '@/components/layout/navigation/BackToLink';

export default function WorkoutsPage() {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <BackToLink href="/train/build" pageName="Build" />
      <WorkoutList />
    </div>
  );
}
