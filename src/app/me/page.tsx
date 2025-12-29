'use client';

import { useEffect, useState } from 'react';
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

  // Load data
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Fetch user profile and workout instances
        const [profileRes, instancesRes] = await Promise.all([
          fetchJson<{ profile: UserProfile }>('/api/me/profile'),
          fetchJson<{ workoutInstances: WorkoutInstance[] }>(
            `/api/train/workouts/instances?dateFrom=${firstDayOfMonth.toISOString()}&dateTo=${lastDayOfMonth.toISOString()}`
          )
        ]);
        
        if (cancelled) return;
        setProfile(profileRes.profile);
        setWorkoutDates(instancesRes.workoutInstances.map(i => new Date(i.date)));

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
          <OverviewTab profile={profile} workoutDates={workoutDates} />
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
