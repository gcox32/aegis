'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { useToast } from '@/components/ui/Toast';
import type { UserProfile } from '@/types/user';
import type { Exercise } from '@/types/train';
import { ExerciseAutocomplete } from '@/components/train/build/exercises/ExerciseAutocomplete';
import Button from '@/components/ui/Button';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Failed to fetch');
  }
  return res.json();
}

export default function KeyExercisesPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Load data
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        // Fetch user profile
        const profileRes = await fetchJson<{ profile: UserProfile | null }>(
          '/api/me/profile'
        );
        if (cancelled) return;

        setProfile(profileRes.profile);

        // Fetch exercise details for key exercises
        if (profileRes.profile?.keyExercises && profileRes.profile.keyExercises.length > 0) {
          const exercisePromises = profileRes.profile.keyExercises.map(exerciseId =>
            fetchJson<{ exercise: Exercise }>(`/api/train/exercises/${exerciseId}`)
              .then(res => res.exercise)
              .catch(() => null)
          );
          const fetchedExercises = (await Promise.all(exercisePromises)).filter(
            (ex): ex is Exercise => ex !== null
          );
          if (!cancelled) {
            setExercises(fetchedExercises);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to load data', err);
          showToast({
            variant: 'error',
            title: 'Something went wrong',
            description: err.message || 'Failed to load key exercises',
          });
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
  }, [showToast]);

  const handleAddExercise = (exercise: Exercise | null) => {
    if (!exercise) return;
    if (exercises.some(ex => ex.id === exercise.id)) return;
    setExercises([...exercises, exercise]);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const handleSaveKeyExercises = async () => {
    if (!profile) return;

    // Validate that all exercises have IDs
    const keyExerciseIds = exercises
      .map(ex => ex.id)
      .filter((id): id is string => Boolean(id));
    
    if (keyExerciseIds.length !== exercises.length) {
      showToast({
        variant: 'error',
        title: 'Invalid exercises',
        description: 'Some exercises are missing IDs. Please try again.',
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/me/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyExercises: keyExerciseIds,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to save key exercises');
      }

      const data = await res.json() as { profile: UserProfile };
      setProfile(data.profile);

      showToast({
        variant: 'success',
        title: 'Key exercises updated',
        description: 'Your key exercises have been saved.',
      });
    } catch (err: any) {
      showToast({
        variant: 'error',
        title: 'Something went wrong',
        description: err.message || 'Failed to save key exercises',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout
        breadcrumbHref="/me/goals"
        breadcrumbText="Goals"
        title="Key Exercises"
        subtitle="Manage your key exercises"
      >
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      breadcrumbHref="/me/goals"
      breadcrumbText="Goals"
      title="Key Exercises"
      subtitle="Manage your key exercises"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block font-medium text-sm">Add Exercise</label>
          <ExerciseAutocomplete
            onChange={handleAddExercise}

          />
        </div>

        {exercises.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block font-medium text-sm">Selected Exercises</label>
              <div className="space-y-2">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex justify-between items-center bg-card p-3 border border-border rounded-lg"
                  >
                    <span className="font-medium">{exercise.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(exercise.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <Button
              onClick={handleSaveKeyExercises}
              disabled={saving}
              className="w-full"
            >
              {saving ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        ) : (
          <div className="py-8 text-muted-foreground text-center">
            <p>No key exercises selected.</p>
            <p className="mt-2 text-sm">Add exercises above to get started.</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

