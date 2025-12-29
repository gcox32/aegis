'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { calculateFuelRecommendations } from '@/lib/fuel/recommendations';
import type { UserProfile } from '@/types/user';
import type { FuelRecommendations } from '@/lib/fuel/recommendations';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Failed to fetch');
  }
  return res.json();
}

const COLORS = {
  protein: '#3b82f6', // blue
  carbs: '#10b981',   // green
  fat: '#f59e0b',      // amber
};

export default function TargetsTab() {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<FuelRecommendations | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile, goals, and latest stats
        const [profileRes, goalsRes, statsRes] = await Promise.all([
          fetchJson<{ profile: UserProfile }>('/api/me/profile'),
          fetchJson<{ goals: any[] }>('/api/me/goals'),
          fetchJson<{ stats: any }>('/api/me/stats?latest=true'),
        ]);

        if (cancelled) return;

        const profile = profileRes.profile;
        if (!profile) {
          setError('Profile not found. Please complete your profile setup.');
          return;
        }

        // Add goals and latest stats to profile
        const profileWithData = {
          ...profile,
          goals: goalsRes.goals,
          latestStats: statsRes.stats || undefined,
        };

        // Calculate recommendations
        const recs = calculateFuelRecommendations(profileWithData);
        setRecommendations(recs);

      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to load recommendations', err);
          setError(err.message || 'Failed to load recommendations');
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
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  if (!recommendations || !recommendations.calorieTarget || !recommendations.macros) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground text-sm">
          Unable to calculate recommendations. Please ensure you have completed your profile with height, weight, gender, and birth date.
        </p>
      </div>
    );
  }

  const { bmr, tdee, calorieTarget, macros } = recommendations;

  // Calculate macro calories for pie chart
  const proteinCalories = (macros.protein || 0) * 4;
  const carbsCalories = (macros.carbs || 0) * 4;
  const fatCalories = (macros.fat || 0) * 9;

  const pieData = [
    { name: 'Protein', value: proteinCalories, grams: macros.protein || 0 },
    { name: 'Carbs', value: carbsCalories, grams: macros.carbs || 0 },
    { name: 'Fat', value: fatCalories, grams: macros.fat || 0 },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.payload.grams}g ({data.value} cal)
          </p>
          <p className="text-xs text-muted-foreground">
            {((data.value / calorieTarget) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Calorie Targets */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Daily Calorie Targets</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-muted-foreground text-sm mb-1">BMR</p>
            <p className="text-2xl font-bold">{bmr?.toLocaleString() || '—'}</p>
            <p className="text-xs text-muted-foreground mt-1">Basal Metabolic Rate</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm mb-1">TDEE</p>
            <p className="text-2xl font-bold">{tdee?.toLocaleString() || '—'}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Daily Energy Expenditure</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm mb-1">Target</p>
            <p className="text-2xl font-bold text-brand-primary">
              {calorieTarget?.toLocaleString() || '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Daily Calorie Goal</p>
          </div>
        </div>
      </div>

      {/* Macro Targets */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Macro Targets</h3>
        
        {/* Pie Chart */}
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => {
                  const colorKey = entry.name.toLowerCase() as keyof typeof COLORS;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[colorKey] || '#8884d8'} 
                    />
                  );
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Macro Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.protein }} />
              <p className="font-medium text-sm">Protein</p>
            </div>
            <p className="text-2xl font-bold">{macros.protein?.toLocaleString() || '—'}g</p>
            <p className="text-xs text-muted-foreground mt-1">
              {proteinCalories} calories ({((proteinCalories / calorieTarget) * 100).toFixed(1)}%)
            </p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.carbs }} />
              <p className="font-medium text-sm">Carbs</p>
            </div>
            <p className="text-2xl font-bold">{macros.carbs?.toLocaleString() || '—'}g</p>
            <p className="text-xs text-muted-foreground mt-1">
              {carbsCalories} calories ({((carbsCalories / calorieTarget) * 100).toFixed(1)}%)
            </p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.fat }} />
              <p className="font-medium text-sm">Fat</p>
            </div>
            <p className="text-2xl font-bold">{macros.fat?.toLocaleString() || '—'}g</p>
            <p className="text-xs text-muted-foreground mt-1">
              {fatCalories} calories ({((fatCalories / calorieTarget) * 100).toFixed(1)}%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

