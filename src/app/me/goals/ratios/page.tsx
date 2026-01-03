'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import { FormGroup, FormLabel, FormInput } from '@/components/ui/Form';
import type { UserProfile } from '@/types/user';
import { maleRatios, femaleRatios } from '@/components/log/stats/ratiosConfig';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Failed to fetch');
  }
  return res.json();
}

export default function TargetRatiosPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [targetInputs, setTargetInputs] = useState<Record<string, string>>({});
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

        // Initialize target inputs with current values or defaults
        if (profileRes.profile?.gender) {
          const configs = profileRes.profile.gender === 'male' ? maleRatios : femaleRatios;
          const inputs: Record<string, string> = {};
          configs.forEach(config => {
            const userTarget = profileRes.profile?.targetRatios?.[config.label];
            inputs[config.label] = (userTarget ?? config.target ?? '').toString();
          });
          if (!cancelled) {
            setTargetInputs(inputs);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to load data', err);
          showToast({
            variant: 'error',
            title: 'Something went wrong',
            description: err.message || 'Failed to load target ratios',
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

  const handleSaveTargets = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      // Convert string inputs to numbers, filtering out empty/invalid values
      const targets: Record<string, number> = {};
      Object.entries(targetInputs).forEach(([label, value]) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue > 0) {
          targets[label] = numValue;
        }
      });

      const res = await fetch('/api/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRatios: targets }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to save target ratios');
      }

      const data = await res.json() as { profile: UserProfile };
      setProfile(data.profile);

      showToast({
        variant: 'success',
        title: 'Target ratios updated',
        description: 'Your target ratios have been saved.',
      });
    } catch (err: any) {
      showToast({
        variant: 'error',
        title: 'Something went wrong',
        description: err.message || 'Failed to save target ratios',
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
        title="Target Ratios"
        subtitle="Manage your anthropomorphic ratio targets"
      >
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (!profile?.gender) {
    return (
      <PageLayout
        breadcrumbHref="/me/goals"
        breadcrumbText="Goals"
        title="Target Ratios"
        subtitle="Manage your anthropomorphic ratio targets"
      >
        <div className="py-8 text-muted-foreground text-center">
          <p>Please set your gender in your profile to view target ratios.</p>
        </div>
      </PageLayout>
    );
  }

  const configs = profile.gender === 'male' ? maleRatios : femaleRatios;
  const hasAnyTargets = configs.some(config => {
    const userTarget = profile.targetRatios?.[config.label];
    return userTarget !== undefined || config.target !== undefined;
  });

  return (
    <PageLayout
      breadcrumbHref="/me/goals"
      breadcrumbText="Goals"
      title="Target Ratios"
      subtitle="Manage your anthropomorphic ratio targets"
    >
      <div className="space-y-6">
        <div className="bg-card p-4 border border-border rounded-lg">
          <p className="text-muted-foreground text-sm">
            Set target values for your body proportion ratios. These targets will be used to track your progress in the Stats Overview.
          </p>
        </div>

        <div className="space-y-4">
          {configs.map((config) => {
            const currentTarget = profile.targetRatios?.[config.label] ?? config.target;
            const hasDefault = config.target !== undefined;

            return (
              <div
                key={config.label}
                className="bg-card p-4 border border-border rounded-lg"
              >
                <FormGroup>
                  <FormLabel>
                    {config.label}
                    {hasDefault && (
                      <span className="ml-2 text-muted-foreground text-xs font-normal">
                        (Default: {config.target?.toFixed(3)})
                      </span>
                    )}
                  </FormLabel>
                  <FormInput
                    type="number"
                    step="0.001"
                    min="0"
                    value={targetInputs[config.label] || ''}
                    onChange={(e) => setTargetInputs({
                      ...targetInputs,
                      [config.label]: e.target.value,
                    })}
                    placeholder={hasDefault ? config.target?.toFixed(3) : 'Set target...'}
                  />
                  {currentTarget !== undefined && (
                    <p className="mt-1 text-muted-foreground text-xs">
                      Current target: {currentTarget.toFixed(3)}
                    </p>
                  )}
                </FormGroup>
              </div>
            );
          })}
        </div>

        <Button
          onClick={handleSaveTargets}
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 w-4 h-4" />
              Save Targets
            </>
          )}
        </Button>

        {!hasAnyTargets && (
          <div className="py-8 text-muted-foreground text-center">
            <p>No targets set.</p>
            <p className="mt-2 text-sm">Set target values above to track your progress.</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

