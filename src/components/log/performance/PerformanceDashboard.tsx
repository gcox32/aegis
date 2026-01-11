'use client';

import { WorkoutInstance, WorkoutBlockExerciseInstance, Exercise } from '@/types/train';
import { PerformanceLineChart } from './PerformanceLineChart';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { usePreferences } from '@/lib/preferences';
import TabLayout, { Tab } from '@/components/ui/TabLayout';
import { Activity, Zap, Weight, Target, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface PerformanceDashboardProps {
  workoutStats: WorkoutInstance[];
  keyExerciseStats: {
    exercise: Exercise;
    instances: WorkoutBlockExerciseInstance[];
  }[];
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  trend?: number;
  color?: string;
}

function StatCard({ icon, label, value, subtitle, trend, color = 'text-brand-primary' }: StatCardProps) {
  const getTrendIcon = () => {
    if (trend === undefined) return null;
    if (trend > 0) return <TrendingUp className="w-3.5 h-3.5" />;
    if (trend < 0) return <TrendingDown className="w-3.5 h-3.5" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === undefined) return 'text-muted-foreground';
    if (trend > 0) return 'text-success';
    if (trend < 0) return 'text-brand-accent';
    return 'text-muted-foreground';
  };

  return (
    <div className="bg-card p-4 border border-border rounded-(--radius) hover:border-white/20 transition-all">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="font-medium text-xs">
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </div>
      <div className="mb-0.5 font-display font-bold text-foreground text-2xl">
        {value}
      </div>
      {subtitle && (
        <div className="text-muted-foreground text-xs">
          {subtitle}
        </div>
      )}
    </div>
  );
}

export default function PerformanceDashboard({ workoutStats, keyExerciseStats }: PerformanceDashboardProps) {
  const { preferences } = usePreferences();

  // Calculate summary statistics
  const completedWorkouts = workoutStats.filter(w => w.complete);
  const totalWorkouts = workoutStats.length;
  
  // Calculate weekly stats
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = subDays(thisWeekStart, 7);
  const lastWeekEnd = subDays(thisWeekEnd, 7);

  const thisWeekWorkouts = completedWorkouts.filter(w => 
    isWithinInterval(new Date(w.date), { start: thisWeekStart, end: thisWeekEnd })
  );
  const lastWeekWorkouts = completedWorkouts.filter(w => 
    isWithinInterval(new Date(w.date), { start: lastWeekStart, end: lastWeekEnd })
  );

  const weeklyChange = lastWeekWorkouts.length > 0 
    ? ((thisWeekWorkouts.length - lastWeekWorkouts.length) / lastWeekWorkouts.length) * 100
    : undefined;

  // Calculate volume stats
  const volumes = completedWorkouts
    .filter(w => w.volume?.value)
    .map(w => w.volume!.value);
  const maxVolume = volumes.length > 0 ? Math.max(...volumes) : 0;
  const avgVolume = volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : 0;
  const latestVolume = volumes.length > 0 ? volumes[volumes.length - 1] : 0;
  const previousVolume = volumes.length >= 2 ? volumes[volumes.length - 2] : null;
  const volumeChange = previousVolume ? ((latestVolume - previousVolume) / previousVolume) * 100 : undefined;

  // Calculate work stats
  const works = completedWorkouts
    .filter(w => w.work?.value)
    .map(w => w.work!.value);
  const maxWork = works.length > 0 ? Math.max(...works) : 0;
  const avgWork = works.length > 0 ? works.reduce((a, b) => a + b, 0) / works.length : 0;

  // Calculate power stats
  const powers = completedWorkouts
    .filter(w => w.averagePower?.value)
    .map(w => w.averagePower!.value);
  const maxPower = powers.length > 0 ? Math.max(...powers) : 0;
  const avgPower = powers.length > 0 ? powers.reduce((a, b) => a + b, 0) / powers.length : 0;

  // Prepare data for Workout Stats
  const volumeData = completedWorkouts
    .filter(w => w.volume?.value)
    .map(w => ({
      date: new Date(w.date),
      value: w.volume!.value,
      label: format(new Date(w.date), 'MMM d'),
    }));

  const workData = completedWorkouts
    .filter(w => w.work?.value)
    .map(w => ({
      date: new Date(w.date),
      value: w.work!.value,
      label: format(new Date(w.date), 'MMM d'),
    }));

  const powerData = completedWorkouts
    .filter(w => w.averagePower?.value)
    .map(w => ({
      date: new Date(w.date),
      value: w.averagePower!.value,
      label: format(new Date(w.date), 'MMM d'),
    }));

  const tabs: Tab[] = [
    {
      id: 'workouts',
      label: 'Workout Stats',
      content: (
        <div className="space-y-6 px-4 md:px-6">


          {/* Charts */}
          <div className="gap-6 grid md:grid-cols-1">
            <div className="bg-card p-6 border border-border rounded-(--radius)">
              <PerformanceLineChart 
                data={volumeData} 
                title="Training Volume" 
                unit={volumeData.length > 0 && workoutStats.find(w => w.volume)?.volume?.unit || 'kg'}
                color="#a855f7"
              />
            </div>
            <div className="bg-card p-6 border border-border rounded-(--radius)">
              <PerformanceLineChart 
                data={workData} 
                title="Total Work" 
                unit={workData.length > 0 && workoutStats.find(w => w.work)?.work?.unit || 'J'}
                color="#f59e0b"
              />
            </div>
            <div className="bg-card p-6 border border-border rounded-(--radius)">
              <PerformanceLineChart 
                data={powerData} 
                title="Average Power" 
                unit={powerData.length > 0 && workoutStats.find(w => w.averagePower)?.averagePower?.unit || 'W'}
                color="#ef4444"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'exercises',
      label: 'Key Exercises',
      content: (
        <div className="space-y-6 px-4 md:px-6">
          {keyExerciseStats.length === 0 ? (
            <div className="bg-card p-12 border border-border border-dashed rounded-(--radius) text-center">
              <Target className="opacity-50 mx-auto mb-4 w-12 h-12 text-muted-foreground" />
              <p className="mb-2 text-muted-foreground text-sm">
                No key exercises selected
              </p>
              <p className="text-muted-foreground text-xs">
                Go to your profile to select key exercises to track
              </p>
            </div>
          ) : (
            <div className="gap-6 grid md:grid-cols-1 lg:grid-cols-2">
              {keyExerciseStats.map(({ exercise, instances }) => {
                // Filter out instances from 'prep' or 'warm-up' workout blocks
                const filteredInstances = instances.filter(inst => {
                  const blockType = inst.workoutBlockInstance?.workoutBlock?.workoutBlockType;
                  return blockType !== 'prep' && blockType !== 'warm-up';
                });

                // Group by date and find max projected1RM per date
                const maxByDate = filteredInstances.reduce((acc, curr) => {
                  if (!curr.projected1RM?.value) return acc;
                  
                  const dateKey = format(new Date(curr.created_at), 'yyyy-MM-dd');
                  const existing = acc.get(dateKey);
                  
                  if (!existing || curr.projected1RM.value.value > existing.projected1RM!.value.value) {
                    acc.set(dateKey, curr);
                  }
                  return acc;
                }, new Map<string, WorkoutBlockExerciseInstance>());

                const data = Array.from(maxByDate.values())
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map(i => ({
                    date: new Date(i.created_at),
                    value: i.projected1RM!.value.value,
                    label: format(new Date(i.created_at), 'MMM d'),
                  }));

                const unit = instances[0]?.projected1RM?.value.unit || preferences.preferredWeightUnit;

                return (
                  <div key={exercise.id} className="bg-card p-6 border border-border rounded-(--radius)">
                    <PerformanceLineChart
                      data={data}
                      title={exercise.name}
                      unit={unit}
                      color="#10b981"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ),
    },
  ];

  return <TabLayout tabs={tabs} defaultTab="workouts" />;
}

