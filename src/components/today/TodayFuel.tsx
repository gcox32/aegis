'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import type { MealInstance } from '@/types/fuel';
import type { UserProfile } from '@/types/user';
import { Utensils, Mic, Loader2 } from 'lucide-react';
import { fetchJson } from '@/lib/train/helpers';
import { calculateFuelRecommendations } from '@/lib/fuel/recommendations';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function TodayFuel() {
  const router = useRouter();
  const [instances, setInstances] = useState<MealInstance[]>([]);
  const [recommendations, setRecommendations] = useState<{
    calorieTarget?: number;
    macros?: { protein?: number };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        console.log('startOfDay', startOfDay);
        console.log('endOfDay', endOfDay);
        const [instancesData, profileRes, goalsRes, statsRes] = await Promise.all([
          fetchJson<MealInstance[]>(
            `/api/fuel/meals/instances?dateFrom=${startOfDay.toISOString()}&dateTo=${endOfDay.toISOString()}`
          ),
          fetchJson<{ profile: UserProfile }>('/api/me/profile'),
          fetchJson<{ goals: any[] }>('/api/me/goals'),
          fetchJson<{ stats: any[] }>('/api/me/stats?latest=true'),
        ]);

        if (cancelled) return;

        // Convert date strings to Date objects
        const instancesWithDates = instancesData.map((instance) => ({
          ...instance,
          date: new Date(instance.date),
          timestamp: instance.timestamp ? new Date(instance.timestamp) : null,
        }));

        setInstances(instancesWithDates);

        // Calculate recommendations
        const profile = profileRes.profile;
        if (profile) {
          const profileWithData = {
            ...profile,
            goals: goalsRes.goals,
            latestStats: statsRes.stats?.[0] || undefined,
          };
          const recs = calculateFuelRecommendations(profileWithData);
          setRecommendations(recs);
        }
      } catch (err: any) {
        console.error('Failed to load meal data for Today page', err);
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

  // Calculate current day totals
  const currentCalories = instances.reduce(
    (sum, instance) => sum + (instance.calories || 0),
    0
  );
  const currentProtein = instances.reduce(
    (sum, instance) => sum + (instance.macros?.protein || 0),
    0
  );

  const calorieTarget = recommendations?.calorieTarget || 0;
  const proteinTarget = recommendations?.macros?.protein || 0;

  // Calculate what's left (remaining)
  const caloriesLeft = Math.max(0, calorieTarget - currentCalories);
  const proteinLeft = Math.max(0, proteinTarget - currentProtein);

  // Calculate percentage consumed
  const caloriePercentage =
    calorieTarget > 0
      ? Math.min(100, (currentCalories / calorieTarget) * 100)
      : 0;
  const proteinPercentage =
    proteinTarget > 0
      ? Math.min(100, (currentProtein / proteinTarget) * 100)
      : 0;

  // Data for donut charts
  const calorieData =
    calorieTarget > 0
      ? [
          { name: 'consumed', value: currentCalories, fill: '#6b7280' },
          { name: 'remaining', value: caloriesLeft, fill: '#1f2937' },
        ]
      : [{ name: 'empty', value: 100, fill: '#1f2937' }];

  const proteinData =
    proteinTarget > 0
      ? [
          { name: 'consumed', value: currentProtein, fill: '#3b82f6' },
          { name: 'remaining', value: proteinLeft, fill: '#1f2937' },
        ]
      : [{ name: 'empty', value: 100, fill: '#1f2937' }];

  // Shared card wrapper
  const CardWrapper = ({
    children,
    className = '',
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={`
        relative overflow-hidden
        bg-linear-to-br from-white/8 to-transparent
        border border-white/10
        rounded-(--radius)
        p-5
        ${className}
      `}
    >
      {children}
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <CardWrapper className="flex justify-center items-center min-h-[200px]">
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
      <CardWrapper className="flex justify-center items-center min-h-[200px] text-error">
        <p className="text-sm">{loadError}</p>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-white/5 p-2 rounded-xl ring-1 ring-white/10">
          <Utensils className="w-5 h-5 text-muted-foreground" />
        </div>
        <h3 className="font-display font-bold text-lg tracking-tight">
          Today&apos;s Food
        </h3>
      </div>

      {/* Content */}
      <div className="flex items-center gap-6">
        {/* Left side: Stats */}
        <div className="flex-1 space-y-4">
          {/* Calories */}
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-b from-white/60 to-white/20 rounded-full w-1 h-10" />
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-2xl tracking-tight">
                  {Math.round(caloriesLeft)}
                </span>
                <span className="text-muted-foreground text-xs">
                  cal left
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 bg-white/10 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-white/40 rounded-full h-full transition-all duration-500"
                    style={{ width: `${caloriePercentage}%` }}
                  />
                </div>
                <span className="w-8 text-muted-foreground text-xs">
                  {caloriePercentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Protein */}
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-b from-brand-primary to-brand-primary/40 rounded-full w-1 h-10" />
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-2xl tracking-tight">
                  {Math.round(proteinLeft)}
                </span>
                <span className="text-muted-foreground text-xs">
                  g protein left
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 bg-brand-primary/20 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-brand-primary rounded-full h-full transition-all duration-500"
                    style={{ width: `${proteinPercentage}%` }}
                  />
                </div>
                <span className="w-8 text-muted-foreground text-xs">
                  {proteinPercentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Donut Chart */}
        <div className="relative w-24 h-24 shrink-0">
          <ResponsiveContainer width={96} height={96}>
            <PieChart>
              {/* Outer ring: Calories */}
              <Pie
                data={calorieData}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={48}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                {calorieData.map((entry, index) => (
                  <Cell key={`calorie-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              {/* Inner ring: Protein */}
              <Pie
                data={proteinData}
                cx="50%"
                cy="50%"
                innerRadius={18}
                outerRadius={28}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                {proteinData.map((entry, index) => (
                  <Cell key={`protein-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-5">
        <Button
          variant="primary"
          fullWidth
          onClick={() => router.push('/fuel?tab=record')}
          className="flex-1"
        >
          Log Food
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push('/fuel/voice-journal')}
          className="px-3 aspect-square"
        >
          <Mic className="w-4 h-4" />
        </Button>
      </div>
    </CardWrapper>
  );
}
