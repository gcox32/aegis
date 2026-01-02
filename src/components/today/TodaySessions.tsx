'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { WorkoutAutocomplete } from '@/components/train/build/workouts/WorkoutAutocomplete';
import type { Workout, WorkoutInstance } from '@/types/train';
import { getLocalDateString } from '@/lib/utils';
import { CheckCircle2, Play, Dumbbell, ChevronRight, Loader2 } from 'lucide-react';
import { fetchJson } from '@/lib/train/helpers';

type ApiListResponse<T> = { [key: string]: T[] };

export default function TodaySessions() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [instances, setInstances] = useState<WorkoutInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [startingWorkoutId, setStartingWorkoutId] = useState<string | null>(
    null
  );
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const [workoutsData, instancesData] = await Promise.all([
          fetchJson<ApiListResponse<Workout>>('/api/train/workouts'),
          fetchJson<{ workoutInstances: WorkoutInstance[] }>(`/api/train/workouts/instances?dateFrom=${yesterday.toISOString()}`)
        ]);

        if (cancelled) return;
        setWorkouts(workoutsData.workouts || []);
        setInstances(instancesData.workoutInstances || []);
      } catch (err: any) {
        console.error('Failed to load data for Today page', err);
        if (!cancelled) {
          setLoadError(err?.message || 'Failed to load data');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const workoutsById = new Map(workouts.map((w) => [w.id, w]));

  function handleSelect(workout: Workout | null) {
    setSelectedWorkoutId(workout?.id || null);
  }

  async function handleStart() {
    if (!selectedWorkoutId || startingWorkoutId) return;

    setStartingWorkoutId(selectedWorkoutId);
    try {
      const res = await fetchJson<{ workoutInstance: WorkoutInstance }>(
        '/api/train/workouts/instances',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workoutId: selectedWorkoutId,
            date: getLocalDateString(),
            complete: false,
          }),
        }
      );
      if (!res.workoutInstance?.id) {
        throw new Error('Failed to create workout instance - no ID returned');
      }

      router.push(`/train/session/${res.workoutInstance.id}`);
    } catch (err: any) {
      console.error('Failed to start workout', err);
      alert('Failed to start workout. Please try again.');
      setStartingWorkoutId(null);
    }
  }

  // Identify status
  // 1. In Progress: Find most recent incomplete instance
  const inProgressInstance = instances.find(i => !i.complete);

  // 2. Completed Today: Find instance completed today
  const todayString = getLocalDateString().split('T')[0];
  const completedTodayInstance = instances.find(i => {
    // Convert the stored UTC instance date to a Local String before comparing
    const iDate = getLocalDateString(new Date(i.date)).split('T')[0];
    return i.complete && iDate === todayString;
  });

  // Shared card wrapper
  const CardWrapper = ({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <div
      onClick={onClick}
      className={`
        bg-linear-to-br from-white/8 to-transparent
        border border-white/10 hover:border-white/20
        rounded-(--radius)
        p-5
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${onClick ? 'cursor-pointer hover:scale-[1.01] hover:shadow-xl hover:shadow-black/30 active:scale-[0.99]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <CardWrapper className="flex justify-center items-center min-h-[140px]">
        <div className="relative">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full w-8 h-8 animate-pulse" />
        </div>
      </CardWrapper>
    );
  }

  // Error state
  if (loadError) {
    return (
      <CardWrapper className="flex justify-center items-center min-h-[140px] text-error">
        <p className="text-sm">{loadError}</p>
      </CardWrapper>
    );
  }

  // CASE 1: In Progress
  if (inProgressInstance) {
    const workoutName = inProgressInstance.workout?.name || 'Workout';
    return (
      <CardWrapper
        onClick={() => router.push(`/train/session/${inProgressInstance.id}`)}
        className="group"
      >
        {/* Animated glow for in-progress */}
        <div className="-top-20 -right-20 absolute bg-brand-primary/20 blur-3xl rounded-full w-40 h-40 animate-pulse" />

        <div className="z-10 relative flex items-center gap-4">
          {/* Icon */}
          <div className="bg-brand-primary/10 p-3 rounded-2xl ring-1 ring-brand-primary/20 group-hover:scale-110 transition-transform duration-300">
            <Play className="w-6 h-6 text-brand-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-brand-primary/10 px-2 py-0.5 rounded-full ring-1 ring-brand-primary/20 ring-inset font-medium text-brand-primary text-xs">
                In Progress
              </span>
            </div>
            <h3 className="font-display font-bold text-xl truncate tracking-tight">
              {workoutName}
            </h3>
            <p className="text-muted-foreground text-sm">
              Tap to resume
            </p>
          </div>

          {/* Arrow */}
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-all group-hover:translate-x-1 duration-300" />
        </div>
      </CardWrapper>
    );
  }

  // CASE 2: Completed Today
  if (completedTodayInstance && !showPrompt) {
    const workoutName = completedTodayInstance.workout?.name || 'Workout';
    return (
      <CardWrapper className="group">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="bg-success/10 p-3 rounded-2xl ring-1 ring-success/20 group-hover:scale-110 transition-transform duration-300">
            <CheckCircle2 className="w-6 h-6 text-success" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-success/10 px-2 py-0.5 rounded-full ring-1 ring-success/20 ring-inset font-medium text-success text-xs">
                Completed
              </span>
            </div>
            <h3 className="font-display font-bold text-xl truncate tracking-tight">
              {workoutName}
            </h3>
            <p className="text-muted-foreground text-sm">
              You hit this today
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/log/workouts/${completedTodayInstance.id}`)}
            >
              View
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPrompt(true)}
            >
              New
            </Button>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // CASE 3: Prompt to start (Default)
  const isStarting = selectedWorkoutId && startingWorkoutId === selectedWorkoutId;

  return (
    <CardWrapper>
      <div className="flex items-start gap-4">

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="bg-white/5 mb-4 p-3 rounded-2xl ring-1 ring-white/10">
              <Dumbbell className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex flex-col flex-1 min-w-0 text-left">
              <h3 className="font-display font-bold text-xl truncate tracking-tight">
                Get to Work
              </h3>
              <p className="mb-4 text-muted-foreground text-sm text-left">
                Pick a workout and start training
              </p>
            </div>
          </div>

          {/* Workout selector and button */}
          <div className="flex sm:flex-row flex-col gap-3">
            <div className={`flex-1 ${!!startingWorkoutId ? 'opacity-50 pointer-events-none' : ''}`}>
              <WorkoutAutocomplete
                initialWorkoutId={selectedWorkoutId || undefined}
                onChange={handleSelect}
              />
            </div>
            <Button
              variant="primary"
              disabled={!selectedWorkoutId || !!startingWorkoutId}
              onClick={handleStart}
              className="sm:w-auto whitespace-nowrap"
            >
              {isStarting ? 'Starting...' : 'Start'}
            </Button>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}
