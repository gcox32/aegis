'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchJson } from '@/lib/train/helpers';
import { Moon, ChevronRight, Loader2 } from 'lucide-react';
import { SleepInstance } from '@/types/fuel';

export default function LatestSleep() {
  const router = useRouter();
  const [sleep, setSleep] = useState<SleepInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;
        // Fetch sleep logs for today (which represents last night's sleep)
        const res = await fetchJson<{ sleepInstances: SleepInstance[] }>(
          `/api/fuel/sleep?dateFrom=${todayString}`
        );

        if (cancelled) return;

        // Find the one for today
        const todaysSleep = res.sleepInstances.find((s) => {
          const sDate = new Date(s.date);
          const sYear = sDate.getFullYear();
          const sMonth = String(sDate.getMonth() + 1).padStart(2, '0');
          const sDay = String(sDate.getDate()).padStart(2, '0');
          const sDateString = `${sYear}-${sMonth}-${sDay}`;
          return sDateString === todayString;
        });

        setSleep(todaysSleep || null);
      } catch (err: any) {
        console.error('Failed to load sleep data', err);
        if (!cancelled) {
          setError(err?.message || 'Failed to load data');
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

  const getSleepQuality = (hours: number) => {
    if (hours >= 7.5) return { label: 'Great', color: 'text-success' };
    if (hours >= 6) return { label: 'Okay', color: 'text-brand-accent' };
    return { label: 'Low', color: 'text-error' };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center bg-linear-to-br from-white/[0.08] to-transparent border border-white/10 rounded-[2rem] w-full h-full">
        <div className="relative">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          <div className="absolute inset-0 bg-indigo-400/20 blur-xl rounded-full w-6 h-6 animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center bg-linear-to-br from-white/[0.08] to-transparent p-5 border border-white/10 rounded-[2rem] w-full h-full">
        <p className="text-error text-sm text-center">{error}</p>
      </div>
    );
  }

  // CASE 1: Sleep Logged
  if (sleep) {
    const durationHours = sleep.timeAsleep?.value || 0;
    const hours = Math.floor(durationHours);
    const minutes = Math.round((durationHours - hours) * 60);
    const quality = getSleepQuality(durationHours);

    return (
      <button
        onClick={() => router.push(`/log/sleep/${sleep.id}`)}
        className="group relative bg-linear-to-br from-white/[0.08] to-transparent hover:shadow-black/30 hover:shadow-xl p-5 border border-white/10 hover:border-white/20 rounded-[2rem] w-full h-full overflow-hidden text-left hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
      >
        {/* Decorative glow */}
        <div className="-top-20 -right-20 absolute bg-indigo-500/10 opacity-0 group-hover:opacity-100 blur-3xl rounded-full w-40 h-40 transition-opacity duration-500" />

        {/* Content */}
        <div className="z-10 relative flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="bg-indigo-500/10 p-2 rounded-xl ring-1 ring-indigo-500/20 group-hover:scale-110 transition-all duration-300">
              <Moon className="w-5 h-5 text-indigo-400" />
            </div>
            <ChevronRight className="opacity-0 group-hover:opacity-100 w-4 h-4 text-muted-foreground transition-all group-hover:translate-x-1 duration-300" />
          </div>

          {/* Badge */}
          <span className="inline-flex self-start bg-indigo-500/10 mb-2 px-2 py-0.5 rounded-full ring-1 ring-indigo-500/20 ring-inset font-medium text-indigo-400 text-xs">
            Last Night
          </span>

          {/* Main content */}
          <div className="flex flex-col flex-1 justify-end">
            <div className="flex items-baseline gap-1">
              <span className="font-display font-bold text-3xl tracking-tight">
                {hours}
              </span>
              <span className="text-muted-foreground text-sm">h</span>
              <span className="ml-1 font-display font-bold text-3xl tracking-tight">
                {minutes}
              </span>
              <span className="text-muted-foreground text-sm">m</span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium ${quality.color}`}>
                {quality.label}
              </span>
              {sleep.sleepScore !== undefined && (
                <span className="text-muted-foreground text-xs">
                  Score: {sleep.sleepScore}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    );
  }

  // CASE 2: No Sleep Logged
  return (
    <button
      onClick={() => router.push('/log/sleep/new')}
      className="group relative bg-linear-to-br from-white/[0.08] to-transparent hover:shadow-black/30 hover:shadow-xl p-5 border border-white/10 hover:border-white/20 rounded-[2rem] w-full h-full overflow-hidden text-left hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
    >
      {/* Content */}
      <div className="z-10 relative flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="bg-white/5 group-hover:bg-indigo-500/10 p-2 rounded-xl ring-1 ring-white/10 group-hover:ring-indigo-500/20 group-hover:scale-110 transition-all duration-300">
            <Moon className="w-5 h-5 text-muted-foreground group-hover:text-indigo-400 transition-colors duration-300" />
          </div>
          <ChevronRight className="opacity-0 group-hover:opacity-100 w-4 h-4 text-muted-foreground transition-all group-hover:translate-x-1 duration-300" />
        </div>

        {/* Title */}
        <h3 className="mb-1 font-display font-semibold text-muted-foreground text-sm">
          Sleep
        </h3>

        {/* Main content */}
        <div className="flex flex-col flex-1 justify-end">
          <span className="font-medium text-foreground text-lg">
            Log last night
          </span>
          <span className="text-muted-foreground text-xs">
            Tap to record
          </span>
        </div>
      </div>

      {/* Pulse indicator */}
      <div className="top-3 right-3 absolute">
        <span className="relative flex w-2 h-2">
          <span className="inline-flex absolute bg-indigo-400 opacity-75 rounded-full w-full h-full animate-ping" />
          <span className="inline-flex relative bg-indigo-400 rounded-full w-2 h-2" />
        </span>
      </div>
    </button>
  );
}
