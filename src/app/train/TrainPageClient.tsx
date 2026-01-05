'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import PageLayout from '@/components/layout/PageLayout';
import ResumeWorkoutCard from '@/components/train/dashboard/ResumeWorkoutCard';
import QuickActionsCard from '@/components/train/dashboard/QuickActionsCard';
import WeekSummaryCard from '@/components/train/dashboard/WeekSummaryCard';
import StreakCard from '@/components/train/dashboard/StreakCard';
import RecentPRsCard from '@/components/train/dashboard/RecentPRsCard';
import MuscleGroupsCard from '@/components/train/dashboard/MuscleGroupsCard';
import { fetchJson, formatDate } from '@/lib/train/helpers';
import type { TrainPageData } from './actions';
import type { WorkoutInstance } from '@/types/train';

interface TrainPageClientProps {
  data: TrainPageData;
}

export default function TrainPageClient({ data }: TrainPageClientProps) {
  const router = useRouter();
  const [startingWorkoutId, setStartingWorkoutId] = useState<string | null>(null);

  const {
    inProgressInstance,
    activeProtocolInstance,
    activeProtocol,
    activePhase,
    phaseWorkouts,
    weekSummary,
    streak,
    recentPRs,
    keyExercises,
    muscleGroupWork,
    lastWorkout,
  } = data;

  const hasActiveProtocol = activeProtocolInstance && activeProtocol;

  async function handleStartWorkout(workoutId: string) {
    if (startingWorkoutId) return;
    setStartingWorkoutId(workoutId);
    try {
      const res = await fetchJson<{ workoutInstance: WorkoutInstance }>(
        `/api/train/workouts/${workoutId}/instances`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: new Date().toISOString().split('T')[0],
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

  return (
    <PageLayout
      title="Train"
      subtitle="Your training hub"
    >
      <div className="md:mx-auto md:max-w-4xl space-y-6 pb-8">

        {/* Resume In-Progress Workout */}
        {inProgressInstance && (
          <section className="px-4 md:px-6">
            <ResumeWorkoutCard instance={inProgressInstance} />
          </section>
        )}

        {/* Active Protocol Section */}
        {hasActiveProtocol ? (
          <>
            <section className="px-4 md:px-6">
              <h2 className="mb-3 font-semibold text-lg">Current Protocol</h2>
              <div className="bg-card card-gradient p-6 border border-white/5 rounded-(--radius) shadow-lg shadow-black/20">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-brand-primary" />
                  <div>
                    <h3 className="font-semibold">
                      {activeProtocol.name ?? 'Training Protocol'}
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      Started {formatDate(activeProtocolInstance.startDate)} •{' '}
                      {activeProtocol.phases?.length || 0} phases
                      {activePhase && ` • Phase: ${activePhase.name}`}
                    </p>
                  </div>
                </div>
                {activeProtocol.description && (
                  <p className="mb-3 text-muted-foreground text-sm">
                    {activeProtocol.description}
                  </p>
                )}
                {activeProtocol.objectives?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {activeProtocol.objectives.map((obj) => (
                      <span
                        key={obj}
                        className="bg-muted px-2 py-1 rounded-full text-[11px] text-muted-foreground"
                      >
                        {obj}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>

            {/* Current Phase Workouts */}
            {activePhase && phaseWorkouts.length > 0 && (
              <section className="px-4 md:px-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="font-semibold text-lg">Phase: {activePhase.name}</h2>
                    {activePhase.purpose && (
                      <p className="mt-1 text-muted-foreground text-sm">{activePhase.purpose}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  {phaseWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="bg-card shadow-black/20 shadow-lg p-4 border border-white/5 rounded-xl card-gradient"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="mb-1 font-semibold">
                            {workout.name || `${workout.workoutType} Workout`}
                          </h3>
                          {workout.description && (
                            <p className="mb-1 text-muted-foreground text-xs">
                              {workout.description}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <span className="bg-muted px-2 py-1 rounded text-[11px] text-muted-foreground">
                              {workout.workoutType}
                            </span>
                            {workout.estimatedDuration && (
                              <span className="bg-muted px-2 py-1 rounded text-[11px] text-muted-foreground">
                                ~{workout.estimatedDuration} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-evenly gap-4">
                        <Button
                          variant="secondary"
                          size="lg"
                          onClick={() => router.push(`/train/workout/${workout.id}`)}
                          className="w-full"
                        >
                          View
                        </Button>
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={() => handleStartWorkout(workout.id)}
                          disabled={startingWorkoutId === workout.id}
                          className="w-full"
                        >
                          {startingWorkoutId === workout.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Start'
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          /* No Protocol - Show Quick Actions */
          <section className="px-4 md:px-6">
            <QuickActionsCard lastWorkout={lastWorkout} />
          </section>
        )}

        {/* Summary Widgets */}
        <section className="px-4 md:px-6">
          <h2 className="mb-3 font-semibold text-lg">Your Training</h2>
          <div className="grid grid-cols-2 gap-3">
            <WeekSummaryCard summary={weekSummary} />
            <StreakCard streak={streak} />
            <div className="col-span-2">
              <RecentPRsCard prs={recentPRs} keyExercises={keyExercises} />
            </div>
            <div className="col-span-2">
              <MuscleGroupsCard muscleGroups={muscleGroupWork} />
            </div>
          </div>
        </section>

        {/* Build Button */}
        <section className="px-4 md:px-6">
          <Link href="/train/build">
            <Button variant="secondary" size="lg" className="w-full">
              Build
            </Button>
          </Link>
        </section>

      </div>
    </PageLayout>
  );
}
