import ExerciseForm from '@/components/train/build/exercises/ExerciseForm';
import BackToLink from '@/components/layout/navigation/BackToLink';

export default function NewExercisePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <BackToLink href="/train/build/exercises" pageName="Exercises" />
      <ExerciseForm />
    </div>
  );
}

