'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dumbbell, BookOpen, RotateCcw, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { WorkoutAutocomplete } from '@/components/train/build/workouts/WorkoutAutocomplete';
import { fetchJson } from '@/lib/train/helpers';
import { getLocalDateString } from '@/lib/utils';
import type { Workout, WorkoutInstance } from '@/types/train';

interface QuickActionsCardProps {
  lastWorkout: Workout | null;
}

export default function QuickActionsCard({ lastWorkout }: QuickActionsCardProps) {
  const router = useRouter();
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [startingWorkoutId, setStartingWorkoutId] = useState<string | null>(null);

  function handleSelect(workout: Workout | null) {
    setSelectedWorkoutId(workout?.id || null);
  }

  async function handleStart(workoutId: string) {
    if (startingWorkoutId) return;

    setStartingWorkoutId(workoutId);
    try {
      const res = await fetchJson<{ workoutInstance: WorkoutInstance }>(
        `/api/train/workouts/${workoutId}/instances`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: getLocalDateString(),
            complete: false,
          }),
        }
      );
      if (!res.workoutInstance?.id) {
        throw new Error('Failed to create workout instance');
      }
      router.push(`/train/session/${res.workoutInstance.id}`);
    } catch (err) {
      console.error('Failed to start workout', err);
      alert('Failed to start workout. Please try again.');
      setStartingWorkoutId(null);
    }
  }

  const isStarting = selectedWorkoutId && startingWorkoutId === selectedWorkoutId;
  const isRepeatStarting = lastWorkout && startingWorkoutId === lastWorkout.id;

  return (
    <div className="bg-card card-gradient p-6 border border-white/5 rounded-(--radius) shadow-lg shadow-black/20">
      <div className="flex items-center gap-4 mb-5">
        <div>
          <h3 className="font-display font-bold text-xl tracking-tight">
            Start a Workout
          </h3>
          <p className="text-muted-foreground text-sm">
            Pick a workout and get to work
          </p>
        </div>
      </div>

      {/* Workout selector and button */}
      <div className="flex sm:flex-row flex-col gap-3 mb-4">
        <div className={`flex-1 ${startingWorkoutId ? 'opacity-50 pointer-events-none' : ''}`}>
          <WorkoutAutocomplete
            initialWorkoutId={selectedWorkoutId || undefined}
            onChange={handleSelect}
          />
        </div>
        <Button
          variant="primary"
          disabled={!selectedWorkoutId || !!startingWorkoutId}
          onClick={() => selectedWorkoutId && handleStart(selectedWorkoutId)}
          className="sm:w-auto whitespace-nowrap"
        >
          {isStarting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Start'
          )}
        </Button>
      </div>

      {/* Alternative actions */}
      <div className="flex items-center gap-3 pt-4 border-white/5 border-t">
        <span className="text-muted-foreground text-xs">or</span>
        <div className="flex flex-1 gap-2">
          <Link href="/train/build/protocols" className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              <BookOpen className="mr-1.5 w-4 h-4" />
              Browse Protocols
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
