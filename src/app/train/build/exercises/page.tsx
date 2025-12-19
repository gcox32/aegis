import React from 'react';
import ExerciseList from '@/components/train/build/exercises/ExerciseList';
import BackToLink from '@/components/layout/navigation/BackToLink';

export default function ExercisesPage() {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        <BackToLink href="/train/build" pageName="Build" />
        <h2 className="font-bold text-2xl my-4">Exercises</h2>
      <ExerciseList />
    </div>
  );
}
