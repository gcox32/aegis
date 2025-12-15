'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import type { Workout, WorkoutInstance } from '@/types/train';

type ApiListResponse<T> = { [key: string]: T[] };

type SessionSlot = 'am' | 'pm';

interface SlotState {
  am: string | null;
  pm: string | null;
}

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

export default function TodaySessions() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedWorkouts, setSelectedWorkouts] = useState<SlotState>({
    am: null,
    pm: null,
  });
  const [startingWorkoutId, setStartingWorkoutId] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoadingWorkouts(true);
      setLoadError(null);
      try {
        const data = await fetchJson<ApiListResponse<Workout>>(
          '/api/train/workouts'
        );
        if (cancelled) return;
        const list = (data.workouts as Workout[]) ?? [];
        setWorkouts(list);
      } catch (err: any) {
        console.error('Failed to load workouts for Today page', err);
        if (!cancelled) {
          setLoadError(err?.message || 'Failed to load workouts');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingWorkouts(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const workoutsById = new Map(workouts.map((w) => [w.id, w]));

  function handleSelect(slot: SessionSlot, workoutId: string) {
    setSelectedWorkouts((prev) => ({
      ...prev,
      [slot]: workoutId || null,
    }));
  }

  async function handleStart(slot: SessionSlot) {
    const workoutId = selectedWorkouts[slot];
    if (!workoutId || startingWorkoutId) return;

    setStartingWorkoutId(workoutId);
    try {
      const res = await fetchJson<{ workoutInstance: WorkoutInstance }>(
        '/api/train/workout-instances',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workoutId,
            date: new Date().toISOString().split('T')[0],
            complete: false,
          }),
        }
      );

      if (!res.workoutInstance?.id) {
        console.error('Invalid response from API:', res);
        throw new Error('Failed to create workout instance - no ID returned');
      }

      router.push(`/train/session/${res.workoutInstance.id}`);
    } catch (err: any) {
      console.error('Failed to start workout', err);
      alert('Failed to start workout. Please try again.');
      setStartingWorkoutId(null);
    }
  }

  function renderSessionCard(slot: SessionSlot, label: string) {
    const selectedId = selectedWorkouts[slot];
    const selected = selectedId ? workoutsById.get(selectedId) : null;

    const isStarting = selectedId && startingWorkoutId === selectedId;

    return (
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold mb-1">
              {selected
                ? selected.name || `${selected.workoutType} Workout`
                : `${label} Session`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selected?.estimatedDuration
                ? `~${selected.estimatedDuration} min`
                : 'No workout selected yet'}
            </p>
          </div>
          <span className="px-2 py-1 text-xs bg-warning/20 text-warning rounded">
            Not started
          </span>
        </div>

        <div className="space-y-2">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Select workout
            </label>
            <select
              className="w-full px-2 py-1 text-sm bg-background border border-border rounded"
              disabled={isLoadingWorkouts || !!startingWorkoutId}
              value={selectedId || ''}
              onChange={(e) => handleSelect(slot, e.target.value)}
            >
              <option value="">
                {isLoadingWorkouts
                  ? 'Loading workouts...'
                  : 'Choose a workout'}
              </option>
              {!isLoadingWorkouts &&
                workouts.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name || `${w.workoutType} Workout`}
                    {w.estimatedDuration
                      ? ` • ~${w.estimatedDuration} min`
                      : ''}
                  </option>
                ))}
            </select>
            {loadError && (
              <p className="mt-1 text-[11px] text-destructive">{loadError}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              fullWidth
              disabled={!selectedId || !!startingWorkoutId}
              onClick={() => handleStart(slot)}
            >
              {isStarting ? 'Starting...' : 'Start Session'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
      {renderSessionCard('am', 'AM')}
      {renderSessionCard('pm', 'PM')}
    </div>
  );
}


