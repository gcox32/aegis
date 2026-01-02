'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, TrendingDown, TrendingUp, Minus, ChevronRight } from 'lucide-react';
import { fetchJson } from '@/lib/train/helpers';

interface Stats {
  id: string;
  date: string;
  weight?: { value: number; unit: string };
  bodyFat?: { value: number; unit: string };
}

export default function TodayBodyCheckIn() {
  const router = useRouter();
  const [latestStats, setLatestStats] = useState<Stats | null>(null);
  const [previousStats, setPreviousStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        // Get the two most recent stats entries
        const res = await fetchJson<{ stats: Stats[] }>('/api/me/stats?limit=2');

        if (cancelled) return;

        const stats = res.stats || [];
        if (stats.length > 0) {
          setLatestStats(stats[0]);

          // Check if logged today
          const today = new Date();
          const latestDate = new Date(stats[0].date);
          const isToday =
            latestDate.getFullYear() === today.getFullYear() &&
            latestDate.getMonth() === today.getMonth() &&
            latestDate.getDate() === today.getDate();
          setHasLoggedToday(isToday);

          if (stats.length > 1) {
            setPreviousStats(stats[1]);
          }
        }
      } catch (err) {
        console.error('Failed to load stats', err);
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

  // Calculate trend
  const weightTrend =
    latestStats?.weight && previousStats?.weight
      ? latestStats.weight.value - previousStats.weight.value
      : null;

  const getTrendIcon = () => {
    if (weightTrend === null) return null;
    if (weightTrend < -0.1) return <TrendingDown className="w-4 h-4" />;
    if (weightTrend > 0.1) return <TrendingUp className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (weightTrend === null) return 'text-muted-foreground';
    if (weightTrend < -0.1) return 'text-success';
    if (weightTrend > 0.1) return 'text-brand-accent';
    return 'text-muted-foreground';
  };

  const daysSinceLastLog = latestStats
    ? Math.floor(
        (new Date().getTime() - new Date(latestStats.date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const getPromptMessage = () => {
    if (hasLoggedToday) return 'Logged today';
    if (daysSinceLastLog === null) return 'Start tracking';
    if (daysSinceLastLog === 1) return 'Log today';
    if (daysSinceLastLog <= 3) return `${daysSinceLastLog} days ago`;
    return `${daysSinceLastLog} days since last`;
  };

  return (
    <button
      onClick={() => router.push('/log/stats?tab=record')}
      className="group relative bg-linear-to-br from-white/8 to-transparent hover:shadow-black/30 hover:shadow-xl p-5 border border-white/10 hover:border-white/20 rounded-(--radius) w-full h-full overflow-hidden text-left hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
    >
      {/* Decorative glow */}
      <div className="-top-20 -right-20 absolute bg-brand-primary/10 opacity-0 group-hover:opacity-100 blur-3xl rounded-full w-40 h-40 transition-opacity duration-500" />

      {/* Content */}
      <div className="z-10 relative flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div
            className={`
              p-2 rounded-xl
              ${hasLoggedToday
                ? 'bg-success/10 ring-1 ring-success/20'
                : 'bg-white/5 ring-1 ring-white/10'
              }
              transition-all duration-300 group-hover:scale-110
            `}
          >
            <Scale
              className={`w-5 h-5 ${hasLoggedToday ? 'text-success' : 'text-muted-foreground'}`}
            />
          </div>
          <ChevronRight className="opacity-0 group-hover:opacity-100 w-4 h-4 text-muted-foreground transition-all group-hover:translate-x-1 duration-300" />
        </div>

        {/* Title */}
        <h3 className="mb-1 font-display font-semibold text-muted-foreground text-sm">
          Check In
        </h3>

        {/* Main content */}
        <div className="flex flex-col flex-1 justify-end">
          {isLoading ? (
            <div className="bg-white/5 rounded w-20 h-8 animate-pulse" />
          ) : latestStats?.weight ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-3xl tracking-tight">
                  {latestStats.weight.value.toFixed(1)}
                </span>
                <span className="text-muted-foreground text-sm">
                  {latestStats.weight.unit}
                </span>
              </div>

              {/* Trend indicator */}
              <div className="flex items-center gap-2 mt-1">
                {weightTrend !== null && (
                  <span
                    className={`flex items-center gap-1 text-xs ${getTrendColor()}`}
                  >
                    {getTrendIcon()}
                    {Math.abs(weightTrend).toFixed(1)}
                  </span>
                )}
                <span className="text-muted-foreground text-xs">
                  {getPromptMessage()}
                </span>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">
              <span className="block font-medium text-lg">No data yet</span>
              <span className="text-xs">Tap to log your first weigh-in</span>
            </div>
          )}
        </div>
      </div>

      {/* Pulse indicator for "needs attention" */}
      {!hasLoggedToday && daysSinceLastLog !== null && daysSinceLastLog >= 2 && (
        <div className="top-4 right-4 absolute">
          <span className="relative flex w-2 h-2">
            <span className="inline-flex absolute bg-brand-accent opacity-75 rounded-full w-full h-full animate-ping" />
            <span className="inline-flex relative bg-brand-accent rounded-full w-2 h-2" />
          </span>
        </div>
      )}
    </button>
  );
}
