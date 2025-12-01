'use client';

import { useEffect, useMemo, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Play, Pause, Square, ChevronLeft } from 'lucide-react';
import type {
  WorkoutInstance,
  WorkoutBlockInstance,
  WorkoutBlock,
  WorkoutBlockExercise,
  WorkoutBlockExerciseInstance,
} from '@/types/train';
import type { TimeMeasurement, WeightMeasurement } from '@/types/measures';

type WorkoutInstanceResponse = { workoutInstance: WorkoutInstance };
type BlockInstancesResponse = { instances: WorkoutBlockInstance[] };
type BlocksResponse = { blocks: WorkoutBlock[] };
type BlockExercisesResponse = { exercises: WorkoutBlockExercise[] };
type BlockExerciseInstancesResponse = {
  instances: WorkoutBlockExerciseInstance[];
};

function timeToSeconds(duration?: TimeMeasurement | null): number {
  if (!duration) return 0;
  const { value, unit } = duration;
  if (unit === 's') return value;
  if (unit === 'min') return value * 60;
  if (unit === 'hr') return value * 3600;
  return 0;
}

function formatClock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
}

function percentage(done: number, total: number) {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((done / total) * 100));
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

export default function ActiveSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [workoutInstance, setWorkoutInstance] =
    useState<WorkoutInstance | null>(null);
  const [blockInstances, setBlockInstances] = useState<WorkoutBlockInstance[]>(
    []
  );
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([]);
  const [blockExercises, setBlockExercises] = useState<
    Record<string, WorkoutBlockExercise[]>
  >({});
  const [exerciseInstances, setExerciseInstances] = useState<
    Record<string, WorkoutBlockExerciseInstance[]>
  >({});

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  // Simple timer loops
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
      setRestSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // Initial data load
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // 1) Load workout instance core data
        const wi = await fetchJson<WorkoutInstanceResponse>(
          `/api/train/workout-instances/${id}`
        );

        if (cancelled) return;
        setWorkoutInstance(wi.workoutInstance);

        // 2) Load all block instances tied to this workout instance
        const [biRes, blocksRes] = await Promise.all([
          fetchJson<BlockInstancesResponse>(
            `/api/train/workout-block-instances?workoutInstanceId=${id}`
          ),
          wi.workoutInstance?.workoutId
            ? fetchJson<BlocksResponse>(
                `/api/train/workouts/${wi.workoutInstance.workoutId}/blocks`
              )
            : Promise.resolve({ blocks: [] }),
        ]);

        if (cancelled) return;
        setBlockInstances(biRes.instances || []);
        setBlocks(blocksRes.blocks || []);

        // 3) For each block, load its planned exercises
        const exercisesByBlockId: Record<string, WorkoutBlockExercise[]> = {};
        const instancesByBlockId: Record<
          string,
          WorkoutBlockExerciseInstance[]
        > = {};

        for (const block of blocksRes.blocks || []) {
          const exRes = await fetchJson<BlockExercisesResponse>(
            `/api/train/workouts/${wi.workoutInstance.workoutId}/blocks/${block.id}/exercises`
          );
          exercisesByBlockId[block.id] = exRes.exercises || [];

          // Also load any existing performance instances for this block
          const blockInstance = biRes.instances.find(
            (bi) => bi.workoutBlockId === block.id
          );
          if (blockInstance) {
            const instRes =
              await fetchJson<BlockExerciseInstancesResponse>(
                `/api/train/workout-block-exercise-instances?workoutBlockInstanceId=${blockInstance.id}`
              );
            instancesByBlockId[block.id] = instRes.instances || [];
          } else {
            instancesByBlockId[block.id] = [];
          }
        }

        if (cancelled) return;
        setBlockExercises(exercisesByBlockId);
        setExerciseInstances(instancesByBlockId);
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          setError(
            err?.message || 'Unable to load this session. Please try again.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const totalPlannedExercises = useMemo(() => {
    return blocks.reduce((sum, block) => {
      return sum + (blockExercises[block.id]?.length || 0);
    }, 0);
  }, [blocks, blockExercises]);

  // For now, completion is just how many block instances are complete
  const completedBlocks = useMemo(
    () => blockInstances.filter((b) => b.complete).length,
    [blockInstances]
  );

  const sessionName =
    (workoutInstance as any)?.workoutName || 'Workout Session';

  const estimatedDurationSeconds = useMemo(() => {
    if (!blocks.length) return 0;
    return blocks.reduce((sum, block) => {
      const dur = block.estimatedDuration as TimeMeasurement | undefined;
      return sum + timeToSeconds(dur);
    }, 0);
  }, [blocks]);

  const totalVolume = useMemo(() => {
    // very simple: sum weight * reps across all logged instances
    let total = 0;
    Object.values(exerciseInstances).forEach((instances) => {
      instances.forEach((inst) => {
        const reps = inst.measures.reps ?? 0;
        const load = inst.measures.externalLoad?.value ?? 0;
        total += reps * load;
      });
    });
    return total;
  }, [exerciseInstances]);

  async function handleCompleteWorkout() {
    if (!workoutInstance || isCompleting) return;
    setIsCompleting(true);
    try {
      const durationMinutes = Math.max(
        1,
        Math.round(elapsedSeconds / 60 || 0.1)
      );

      // 1) Mark workout instance complete with duration
      const updated = await fetchJson<{ workoutInstance: WorkoutInstance }>(
        `/api/train/workout-instances/${workoutInstance.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            complete: true,
            duration: { value: durationMinutes, unit: 'min' } as TimeMeasurement,
          }),
        }
      );
      setWorkoutInstance(updated.workoutInstance);

      // 2) Write a simple performance entry
      const workValue = totalVolume; // temporary: treat volume as work
      const performanceDuration: TimeMeasurement = {
        value: durationMinutes,
        unit: 'min',
      };

      const performancePayload = {
        date: new Date().toISOString(),
        duration: performanceDuration,
        volume: { value: totalVolume, unit: 'kg' } as WeightMeasurement,
        work: { value: workValue, unit: 'kg' } as any,
        power: {
          value:
            durationMinutes > 0 ? Math.round(workValue / (durationMinutes * 60)) : 0,
          unit: 'W',
        } as any,
        notes: `Auto-logged from workout ${workoutInstance.id}`,
      };

      await fetchJson(`/api/train/performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(performancePayload),
      });
    } catch (e) {
      console.error('Failed to complete workout', e);
    } finally {
      setIsCompleting(false);
    }
  }

  async function upsertExerciseInstance(
    block: WorkoutBlock,
    planned: WorkoutBlockExercise,
    setIndex: number,
    updates: {
      reps?: number;
      weight?: WeightMeasurement | null;
      rpe?: number | null;
      notes?: string;
    }
  ) {
    const blockInstance = blockInstances.find(
      (bi) => bi.workoutBlockId === block.id
    );
    if (!blockInstance) return;

    const existingForBlock = exerciseInstances[block.id] || [];
    const target =
      existingForBlock.find(
        (inst) =>
          inst.workoutBlockExerciseId === planned.id &&
          // crude encoding: use notes prefix to distinguish sets
          inst.notes?.startsWith(`set:${setIndex}:`)
      ) || null;

    const baseMeasures = planned.measures || {};

    const payloadMeasures: typeof baseMeasures = {
      ...baseMeasures,
      reps:
        updates.reps !== undefined
          ? updates.reps
          : target?.measures.reps ?? baseMeasures.reps,
      externalLoad:
        updates.weight !== undefined
          ? updates.weight || undefined
          : target?.measures.externalLoad ?? baseMeasures.externalLoad,
    };

    const payload = {
      complete: true,
      measures: payloadMeasures,
      rpe:
        updates.rpe !== undefined
          ? (updates.rpe as any)
          : target?.rpe ?? null,
      notes:
        updates.notes !== undefined
          ? updates.notes
          : target?.notes ?? `set:${setIndex}:`,
    };

    try {
      let saved: WorkoutBlockExerciseInstance;
      if (target) {
        const res = await fetchJson<{ instance: WorkoutBlockExerciseInstance }>(
          `/api/train/workout-block-exercise-instances/${target.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );
        saved = res.instance;
      } else {
        const res = await fetchJson<{ instance: WorkoutBlockExerciseInstance }>(
          `/api/train/workout-block-exercise-instances`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workoutBlockInstanceId: blockInstance.id,
              workoutBlockExerciseId: planned.id,
              date: new Date().toISOString(),
              complete: true,
              personalBest: false,
              duration: null,
              measures: payloadMeasures,
              projected1RM: null,
              rpe: payload.rpe,
              notes: payload.notes,
            }),
          }
        );
        saved = res.instance;
      }

      setExerciseInstances((current) => {
        const list = current[block.id] || [];
        const idx = list.findIndex((i) => i.id === saved.id);
        const next =
          idx === -1
            ? [...list, saved]
            : [...list.slice(0, idx), saved, ...list.slice(idx + 1)];
        return {
          ...current,
          [block.id]: next,
        };
      });
    } catch (e) {
      console.error('Failed to save exercise instance', e);
    }
  }

  if (loading) {
    return (
      <div className="bg-background pb-20 min-h-screen">
        <div className="md:mx-auto px-4 md:px-6 pt-6 md:max-w-3xl">
          <p className="text-muted-foreground text-sm">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !workoutInstance) {
    console.error('Error loading workout instance', error);
    return (
      <div className="bg-background pb-20 min-h-screen">
        <div className="space-y-4 md:mx-auto px-4 md:px-6 pt-6 md:max-w-3xl">
          <button
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs"
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Train
          </button>
          <div className="bg-card p-4 border border-border rounded-lg">
            <p className="text-destructive text-sm">
              {error ?? 'Session not found.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = percentage(completedBlocks, blocks.length || 1);

  return (
    <div className="bg-background pb-20 min-h-screen">
      <div className="md:mx-auto md:max-w-3xl">
        {/* Header */}
        <section className="px-4 md:px-6 pt-6 pb-4 border-border border-b">
          <button
            className="inline-flex items-center gap-1 mb-2 text-muted-foreground hover:text-foreground text-xs"
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Train
          </button>
          <h1 className="mb-1 font-semibold text-xl">{sessionName}</h1>
          <p className="text-muted-foreground text-xs">
            Active session •{' '}
            {new Date(workoutInstance.date).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </section>

        {/* Timers + Progress */}
        <section className="bg-card/40 px-4 md:px-6 py-4 border-border border-b">
          <div className="flex justify-between items-center gap-3 mb-4">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                Workout Timer
              </p>
              <p className="font-mono font-semibold text-3xl">
                {formatClock(elapsedSeconds)}
              </p>
              {estimatedDurationSeconds > 0 && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Est. {formatClock(estimatedDurationSeconds)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isRunning ? 'outline' : 'primary'}
                onClick={() => setIsRunning((v) => !v)}
              >
                {isRunning ? (
                  <>
                    <Pause className="mr-1 w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-1 w-4 h-4" />
                    Start
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsRunning(false);
                  setElapsedSeconds(0);
                }}
              >
                <Square className="mr-1 w-4 h-4" />
                Reset
              </Button>
              <Button
                size="sm"
                variant={workoutInstance.complete ? 'outline' : 'primary'}
                disabled={isCompleting || workoutInstance.complete}
                onClick={handleCompleteWorkout}
              >
                {workoutInstance.complete ? 'Completed' : 'Complete workout'}
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-1 text-[11px] text-muted-foreground">
              <span>
                Progress • {completedBlocks}/{blocks.length || 0} blocks
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="bg-input rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-primary rounded-full h-2 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                Rest Timer
              </p>
              <p className="font-mono font-semibold text-lg">
                {formatClock(restSeconds)}
              </p>
            </div>
            <div className="flex gap-1">
              {[30, 60, 90].map((sec) => (
                <Button
                  key={sec}
                  size="sm"
                  variant="outline"
                  onClick={() => setRestSeconds(sec)}
                >
                  {sec}s
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Blocks + Exercises */}
        <section className="space-y-4 px-4 md:px-6 py-6">
          {blocks.map((block) => {
            const exercises = blockExercises[block.id] || [];
            const instancesForBlock = exerciseInstances[block.id] || [];
            const instanceForBlock = blockInstances.find(
              (bi) => bi.workoutBlockId === block.id
            );
            const isComplete = instanceForBlock?.complete;

            return (
              <div
                key={block.id}
                className="bg-card p-4 border border-border rounded-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                      {block.workoutBlockType}
                    </p>
                    <h2 className="font-semibold text-sm">
                      {block.name || 'Block'}
                    </h2>
                    {block.description && (
                      <p className="mt-1 text-muted-foreground text-xs">
                        {block.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-[11px] rounded ${
                      isComplete
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : 'bg-warning/20 text-warning'
                    }`}
                  >
                    {isComplete ? 'Done' : 'In progress'}
                  </span>
                </div>

                <div className="space-y-2">
                  {exercises.map((ex, index) => {
                    const sets = ex.sets || 1;
                    const setIndices = Array.from({ length: sets }, (_, i) => i);

                    const instancesForExercise = instancesForBlock.filter(
                      (inst) => inst.workoutBlockExerciseId === ex.id
                    );

                    return (
                      <div
                        key={ex.id}
                        className="bg-background px-3 py-2 border border-border/60 rounded-md"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <p className="font-medium text-sm">
                              {ex.exercise.name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {sets} sets
                              {ex.measures.reps
                                ? ` • ${ex.measures.reps} reps`
                                : ''}
                              {ex.measures.externalLoad
                                ? ` • ${ex.measures.externalLoad.value}${ex.measures.externalLoad.unit}`
                                : ''}
                            </p>
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            #{index + 1}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {setIndices.map((setIdx) => {
                            const existing = instancesForExercise.find((inst) =>
                              inst.notes?.startsWith(`set:${setIdx}:`)
                            );
                            const reps = existing?.measures.reps ?? '';
                            const weight = existing?.measures.externalLoad
                              ?.value ?? '';
                            const rpe = existing?.rpe ?? '';

                            return (
                              <div
                                key={`${ex.id}-set-${setIdx}`}
                                className="flex items-center gap-2 text-xs"
                              >
                                <span className="w-8 text-[11px] text-muted-foreground">
                                  Set {setIdx + 1}
                                </span>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  className="bg-background px-1 border border-border rounded w-16 h-7 text-xs"
                                  placeholder="reps"
                                  defaultValue={reps}
                                  onBlur={(e) =>
                                    upsertExerciseInstance(
                                      block,
                                      ex,
                                      setIdx,
                                      {
                                        reps:
                                          e.target.value === ''
                                            ? undefined
                                            : Number(e.target.value),
                                      }
                                    )
                                  }
                                />
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  className="bg-background px-1 border border-border rounded w-16 h-7 text-xs"
                                  placeholder={
                                    ex.measures.externalLoad?.unit || 'kg'
                                  }
                                  defaultValue={weight}
                                  onBlur={(e) =>
                                    upsertExerciseInstance(
                                      block,
                                      ex,
                                      setIdx,
                                      {
                                        weight:
                                          e.target.value === ''
                                            ? null
                                            : {
                                                value: Number(e.target.value),
                                                unit:
                                                  ex.measures.externalLoad
                                                    ?.unit || 'kg',
                                              },
                                      }
                                    )
                                  }
                                />
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  className="bg-background px-1 border border-border rounded w-12 h-7 text-xs"
                                  placeholder="RPE"
                                  defaultValue={rpe}
                                  onBlur={(e) =>
                                    upsertExerciseInstance(
                                      block,
                                      ex,
                                      setIdx,
                                      {
                                        rpe:
                                          e.target.value === ''
                                            ? null
                                            : Number(e.target.value),
                                      }
                                    )
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {exercises.length === 0 && (
                    <p className="text-muted-foreground text-xs">
                      No exercises configured for this block yet.
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {blocks.length === 0 && (
            <p className="text-muted-foreground text-xs">
              This workout doesn&apos;t have any blocks configured yet. Build
              out the structure in the program editor to see it here during
              sessions.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}


