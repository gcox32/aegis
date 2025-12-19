import WorkoutForm from '@/components/train/build/workouts/WorkoutForm';
import BackToLink from '@/components/layout/navigation/BackToLink';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWorkoutPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      <BackToLink href="/train/build/workouts" pageName="Workouts" />
      <div className="mb-6">
        <h1 className="font-bold text-gray-300 text-3xl">Edit Workout</h1>
        <p className="mt-2 text-gray-600">Modify your workout structure.</p>
      </div>
       <WorkoutForm workoutId={id} isEditing />
    </div>
  );
}

