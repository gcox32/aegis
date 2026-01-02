'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, Settings } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { UserProfile } from '@/types/user';
import { WorkoutInstance } from '@/types/train';
import OverviewTab from '@/components/me/OverviewTab';
import ActivityTab from '@/components/me/ActivityTab';
import TabLayout, { Tab } from '@/components/ui/TabLayout';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Failed to fetch');
  }
  return res.json();
}

export default function MePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workoutDates, setWorkoutDates] = useState<Date[]>([]);
  const [fetchedMonths, setFetchedMonths] = useState<Set<string>>(new Set());
  const fetchedMonthsRef = useRef<Set<string>>(new Set());
  const fetchingMonthsRef = useRef<Set<string>>(new Set());

  // Helper function to get month key (YYYY-MM format)
  const getMonthKey = (year: number, month: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  };

  // Fetch workout instances for a specific month
  const fetchWorkoutInstancesForMonth = useCallback(async (year: number, month: number) => {
    const monthKey = getMonthKey(year, month);
    
    // Skip if already fetched or currently fetching
    if (fetchedMonthsRef.current.has(monthKey) || fetchingMonthsRef.current.has(monthKey)) {
      return;
    }

    // Mark as fetching
    fetchingMonthsRef.current.add(monthKey);

    try {
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);

      const instancesRes = await fetchJson<{ workoutInstances: WorkoutInstance[] }>(
        `/api/train/workouts/instances?dateFrom=${firstDayOfMonth.toISOString()}&dateTo=${lastDayOfMonth.toISOString()}`
      );

      const newDates = instancesRes.workoutInstances.map(i => new Date(i.date));
      
      // Merge with existing dates, avoiding duplicates
      setWorkoutDates(prev => {
        const existingDateStrings = new Set(prev.map(d => d.toISOString().split('T')[0]));
        const uniqueNewDates = newDates.filter(d => !existingDateStrings.has(d.toISOString().split('T')[0]));
        return [...prev, ...uniqueNewDates];
      });

      // Mark month as fetched
      fetchedMonthsRef.current.add(monthKey);
      setFetchedMonths(prev => new Set(prev).add(monthKey));
    } catch (err: any) {
      console.error(`Failed to fetch workout instances for ${monthKey}`, err);
    } finally {
      // Remove from fetching set
      fetchingMonthsRef.current.delete(monthKey);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // Fetch user profile and workout instances
        const [profileRes, instancesRes] = await Promise.all([
          fetchJson<{ profile: UserProfile }>('/api/me/profile'),
          fetchJson<{ workoutInstances: WorkoutInstance[] }>(
            `/api/train/workouts/instances?dateFrom=${firstDayOfMonth.toISOString()}&dateTo=${lastDayOfMonth.toISOString()}`
          )
        ]);

        if (cancelled) return;
        const monthKey = getMonthKey(year, month);
        setProfile(profileRes.profile);
        setWorkoutDates(instancesRes.workoutInstances.map(i => new Date(i.date)));
        fetchedMonthsRef.current.add(monthKey);
        setFetchedMonths(new Set([monthKey]));

      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to load data', err);
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
  }, []);


  if (loading) {
    return (
      <PageLayout
        title="Profile"
      >
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
        </div>
      </PageLayout>
    );
  }

  const tabs: Tab[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="min-h-[400px]">
          <OverviewTab 
            profile={profile} 
            workoutDates={workoutDates}
            onMonthChange={fetchWorkoutInstancesForMonth}
          />
        </div>
      ),
    },
    {
      id: 'activity',
      label: 'Activity',
      content: (
        <div className="min-h-[400px]">
          <ActivityTab />
        </div>
      ),
    },
  ];

  return (
    <PageLayout
      title="Profile"
    >
      <TabLayout tabs={tabs} defaultTab="overview" />
    </PageLayout>
  );
}
