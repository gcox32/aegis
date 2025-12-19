'use client';

import { useEffect, useState } from 'react';
import { Sliders, Globe, ArrowLeft, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { getUserPreferences, saveUserPreferences, type UserPreferences } from '@/lib/preferences';
import type { CompositeStrategy } from '@/types/stats';
import { useToast } from '@/components/ui/Toast';
import { TogglePill } from '@/components/ui/TogglePill';
import PageLayout from '@/components/layout/PageLayout';

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<UserPreferences>(getUserPreferences());
  const { showToast } = useToast();

  useEffect(() => {
    setPrefs(getUserPreferences());
  }, []);

  function updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    saveUserPreferences({ [key]: value });
    showToast({
      variant: 'success',
      title: 'Preference saved',
      description: 'Your preference has been updated.',
    });
  }

  return (
    <PageLayout
      breadcrumbHref="/me"
      breadcrumbText="Me"
      title="Preferences"
      subtitle="Customize your app experience"
    >
      <div className="md:mx-auto md:max-w-4xl">
        {/* Header */}
        <section className="px-4 md:px-6 pt-6 pb-4 border-border border-b">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/me"
              className="hover:bg-hover p-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center bg-brand-primary/20 rounded-full w-10 h-10">
                <Sliders className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <h1 className="font-bold text-2xl">Preferences</h1>
                <p className="text-muted-foreground text-sm">
                  Customize your app experience
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* Body Fat Calculation */}
        <section className="px-4 md:px-6 py-6 border-border border-t">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-brand-primary" />
            <h2 className="font-semibold text-lg">Body Fat Calculation</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-card p-4 border border-border rounded-lg">
              <span className="block mb-3 font-medium">Composite Strategy</span>
              <p className="mb-3 text-muted-foreground text-sm">
                How body fat estimation methods are combined
              </p>
              <div className="flex flex-col gap-2">
                {(['median', 'trimmed_mean', 'mean', 'weighted_mean'] as CompositeStrategy[]).map((strategy) => (
                  <button
                    key={strategy}
                    onClick={() => updatePreference('bodyFatStrategy', strategy)}
                    className={`py-2 px-4 border rounded-lg font-semibold text-left transition-colors ${prefs.bodyFatStrategy === strategy
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'border-border hover:bg-hover'
                      }`}
                  >
                    <div className="font-medium capitalize">
                      {strategy === 'trimmed_mean' ? 'Trimmed Mean' : strategy === 'weighted_mean' ? 'Weighted Mean' : strategy}
                    </div>
                    <div className="opacity-80 mt-0.5 text-xs">
                      {strategy === 'median' && 'Use the middle value (most robust to outliers)'}
                      {strategy === 'trimmed_mean' && 'Average after removing outliers'}
                      {strategy === 'mean' && 'Simple average of all methods'}
                      {strategy === 'weighted_mean' && 'Weighted average (customizable)'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-card p-4 border border-border rounded-lg">
              <label className="block mb-3 font-medium">Maximum Age for Stats Lookup</label>
              <p className="mb-3 text-muted-foreground text-sm">
                When calculating body fat, how many days back should we look for missing measurements?
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={prefs.bodyFatMaxDaysOld}
                  onChange={(e) => {
                    const value = Math.max(1, Math.min(365, parseInt(e.target.value) || 30));
                    updatePreference('bodyFatMaxDaysOld', value);
                  }}
                  className="bg-zinc-950/60 focus:bg-zinc-900/80 px-3 py-2 border border-zinc-800 focus:border-brand-primary rounded-lg outline-none ring-0 w-24 text-white text-sm transition-colors"
                />
                <span className="text-muted-foreground text-sm">days</span>
              </div>
            </div>
          </div>
        </section>

        {/* Units */}
        <section className="px-4 md:px-6 py-6 border-border border-t">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-brand-primary" />
            <h2 className="font-semibold text-lg">Preferred Units</h2>
          </div>
          <div className="space-y-2">
            <div className="bg-card p-4 border border-border rounded-lg">
              <span className="block mb-3 font-medium">Weight</span>
              <div className="flex gap-2">
                <TogglePill
                  leftLabel="lbs"
                  rightLabel="kg"
                  value={prefs.preferredWeightUnit === 'lb'}
                  onChange={(value) => updatePreference('preferredWeightUnit', value ? 'lb' : 'kg')}
                >
                </TogglePill>
              </div>
            </div>
            <div className="bg-card p-4 border border-border rounded-lg">
              <span className="block mb-3 font-medium">Length / Distance</span>
              <div className="flex gap-2">
                <TogglePill
                  leftLabel="inches"
                  rightLabel="cm"
                  value={prefs.preferredLengthUnit === 'in'}
                  onChange={(value) => updatePreference('preferredLengthUnit', value ? 'in' : 'cm')}
                >
                </TogglePill>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PageLayout>
  );
}
