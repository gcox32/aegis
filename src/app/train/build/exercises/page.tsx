import React from 'react';
import ExerciseList from '@/components/train/build/exercises/ExerciseList';
import BackToLink from '@/components/layout/navigation/BackToLink';

export default function ExercisesPage() {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <BackToLink href="/train/build" pageName="Build" />
      <div className="md:flex md:justify-between md:items-center mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-300 text-2xl sm:text-3xl sm:truncate leading-7 sm:tracking-tight">
            Exercises
          </h2>
        </div>
      </div>
      <ExerciseList />
    </div>
  );
}
