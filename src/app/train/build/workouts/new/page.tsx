import React from 'react';
import WorkoutForm from '@/components/train/build/workouts/WorkoutForm';

export default function NewWorkoutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-300">Create New Workout</h1>
        <p className="mt-2 text-gray-600">Design a workout by adding blocks and exercises.</p>
      </div>
      <WorkoutForm />
    </div>
  );
}

