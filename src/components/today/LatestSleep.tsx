'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { TodayCard, TodayCardHeader, TodayCardContent } from '@/components/ui/TodayCard';
import { fetchJson } from '@/lib/train/helpers';
import { Moon, Pencil, Plus } from 'lucide-react';
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
        const todayDateUTC = new Date(todayString);
        // Fetch sleep logs for today (which represents last night's sleep)
        const res = await fetchJson<{ sleepInstances: SleepInstance[] }>(
          `/api/fuel/sleep?dateFrom=${todayString}`
        );

        if (cancelled) return;
        
        // Find the one for today
        const todaysSleep = res.sleepInstances.find(s => {
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

  // CASE 1: Sleep Logged
  if (sleep) {
    const durationHours = sleep.timeAsleep?.value || 0;
    const hours = Math.floor(durationHours);
    const minutes = Math.round((durationHours - hours) * 60);
    const durationString = `${hours}h ${minutes}m`;

    return (
      <TodayCard isLoading={isLoading} error={error || undefined} className="aspect-auto!">
        <TodayCardHeader
          badge={{ label: 'Last Night', variant: 'indigo' }}
          title={durationString}
          subtitle={
            sleep.sleepScore !== undefined
              ? `Score: ${sleep.sleepScore}`
              : 'Logged'
          }
          icon={Moon}
          iconVariant="indigo"
        />
        <TodayCardContent>
          <div className="mt-4">
            <Button 
              variant="outline" 
              fullWidth
              onClick={() => router.push(`/log/sleep/${sleep.id}`)}
              className="flex items-center justify-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </TodayCardContent>
      </TodayCard>
    );
  }

  // CASE 2: No Sleep Logged
  return (
    <TodayCard isLoading={isLoading} error={error || undefined} className="aspect-auto!">
      <TodayCardHeader
        title="How did you sleep?"
        subtitle="Log your rest"
        icon={Moon}
        iconVariant="muted"
      />
      <TodayCardContent>
        <div className="mt-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => router.push('/log/sleep/new')}
            className="flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Log Sleep
          </Button>
        </div>
      </TodayCardContent>
    </TodayCard>
  );
}
