import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import WorkoutList from '@/components/train/build/workouts/WorkoutList';

export default function WorkoutsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/train/build"
        className="inline-flex items-center gap-1 mb-4 text-muted-foreground hover:text-foreground text-xs"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Build
      </Link>
      <WorkoutList />
    </div>
  );
}
