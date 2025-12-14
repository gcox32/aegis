import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ExerciseList from '@/components/train/build/exercises/ExerciseList';

export default function ExercisesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/train/build"
        className="inline-flex items-center gap-1 mb-4 text-muted-foreground hover:text-foreground text-xs"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Build
      </Link>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-300 sm:truncate sm:text-3xl sm:tracking-tight">
            Exercises
          </h2>
        </div>
      </div>
      <ExerciseList />
    </div>
  );
}
