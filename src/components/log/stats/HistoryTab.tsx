'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { UserStats } from '@/types/user';
import { useToast } from '@/components/ui/Toast';

type StatsListResponse = {
  stats: UserStats[];
};

export default function HistoryTab() {
  const [stats, setStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/me/stats', { cache: 'no-store' });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || 'Failed to load stats');
      }
      const data = (await res.json()) as StatsListResponse;
      
      // Convert date strings to Date objects
      const statsWithDates = (data.stats || []).map(stat => ({
        ...stat,
        date: new Date(stat.date),
      }));
      
      setStats(statsWithDates);
    } catch (e: any) {
      showToast({
        variant: 'error',
        title: 'Unable to load stats',
        description: e.message || 'There was a problem loading your stats log.',
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/me/stats/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || 'Failed to delete entry');
      }
      setStats((prev) => prev.filter((s) => s.id !== id));
      showToast({
        variant: 'success',
        title: 'Entry deleted',
        description: 'The stats entry has been removed.',
      });
    } catch (e: any) {
      showToast({
        variant: 'error',
        title: 'Could not delete entry',
        description: e.message || 'There was a problem deleting that entry.',
      });
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center bg-card px-4 py-8 border border-border rounded-xl text-muted-foreground text-sm">
        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
        Loading history...
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="bg-card/40 px-4 py-4 border border-border border-dashed rounded-xl text-muted-foreground text-sm">
        No stats logged yet. Create your first entry in the Log tab.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stats.map((entry) => (
        <StatsEntryCard
          key={entry.id}
          entry={entry}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

function StatsEntryCard({ entry, onDelete }: { entry: UserStats; onDelete: (id: string) => void }) {
  const [showTapeMeasurements, setShowTapeMeasurements] = useState(false);

  const hasTapeMeasurements = entry.tapeMeasurements && 
    Object.entries(entry.tapeMeasurements).some(
      ([_, val]) => val && typeof val === 'object' && 'value' in val
    );

  const tapeMeasurementCount = hasTapeMeasurements
    ? Object.entries(entry.tapeMeasurements!).filter(
        ([_, val]) => val && typeof val === 'object' && 'value' in val
      ).length
    : 0;

  // Group tape measurements by category
  const tapeGroups = hasTapeMeasurements ? {
    core: [
      { key: 'neck', label: 'Neck' },
      { key: 'shoulders', label: 'Shoulders' },
      { key: 'chest', label: 'Chest' },
      { key: 'waist', label: 'Waist' },
      { key: 'hips', label: 'Hips' },
    ],
    arms: [
      { key: 'leftArm', label: 'Left Arm' },
      { key: 'rightArm', label: 'Right Arm' },
      { key: 'leftForearm', label: 'Left Forearm' },
      { key: 'rightForearm', label: 'Right Forearm' },
    ],
    legs: [
      { key: 'leftLeg', label: 'Left Leg' },
      { key: 'rightLeg', label: 'Right Leg' },
      { key: 'leftCalf', label: 'Left Calf' },
      { key: 'rightCalf', label: 'Right Calf' },
    ],
  } : null;

  return (
    <div className="bg-card px-4 py-3 border border-border rounded-xl text-sm">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          {/* Date */}
          <div className="text-muted-foreground text-xs font-medium">
            {new Date(entry.date).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>

          {/* Body Composition Section */}
          {(entry.weight || entry.bodyFatPercentage || entry.muscleMass) && (
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Body Composition
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {entry.weight && (
                  <div className="text-foreground text-sm">
                    <span className="text-muted-foreground text-xs">Weight: </span>
                    <span className="font-medium">{entry.weight.value} {entry.weight.unit}</span>
                  </div>
                )}
                {entry.bodyFatPercentage && (
                  <div className="text-foreground text-sm">
                    <span className="text-muted-foreground text-xs">Body Fat: </span>
                    <span className="font-medium">{entry.bodyFatPercentage.value}%</span>
                  </div>
                )}
                {entry.muscleMass && (
                  <div className="text-foreground text-sm">
                    <span className="text-muted-foreground text-xs">Muscle Mass: </span>
                    <span className="font-medium">{entry.muscleMass.value} {entry.muscleMass.unit}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tape Measurements Section */}
          {hasTapeMeasurements && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setShowTapeMeasurements(!showTapeMeasurements)}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs font-medium uppercase tracking-wide transition-colors"
              >
                Tape Measurements
                <span className="text-muted-foreground/60 text-xs normal-case">
                  ({tapeMeasurementCount})
                </span>
                {showTapeMeasurements ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showTapeMeasurements && tapeGroups && (
                <div className="pt-1 space-y-3">
                  {/* Core Measurements */}
                  {tapeGroups.core.some(item => {
                    const val = entry.tapeMeasurements![item.key as keyof typeof entry.tapeMeasurements];
                    return val && typeof val === 'object' && 'value' in val;
                  }) && (
                    <div>
                      <div className="mb-1.5 text-muted-foreground text-xs font-medium">Core</div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                        {tapeGroups.core.map(item => {
                          const val = entry.tapeMeasurements![item.key as keyof typeof entry.tapeMeasurements] as any;
                          if (!val || typeof val !== 'object' || !('value' in val)) return null;
                          return (
                            <div key={item.key} className="text-foreground text-sm">
                              <span className="text-muted-foreground text-xs">{item.label}: </span>
                              <span className="font-medium">{val.value} {val.unit}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Arms */}
                  {tapeGroups.arms.some(item => {
                    const val = entry.tapeMeasurements![item.key as keyof typeof entry.tapeMeasurements];
                    return val && typeof val === 'object' && 'value' in val;
                  }) && (
                    <div>
                      <div className="mb-1.5 text-muted-foreground text-xs font-medium">Arms</div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                        {tapeGroups.arms.map(item => {
                          const val = entry.tapeMeasurements![item.key as keyof typeof entry.tapeMeasurements] as any;
                          if (!val || typeof val !== 'object' || !('value' in val)) return null;
                          return (
                            <div key={item.key} className="text-foreground text-sm">
                              <span className="text-muted-foreground text-xs">{item.label}: </span>
                              <span className="font-medium">{val.value} {val.unit}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Legs */}
                  {tapeGroups.legs.some(item => {
                    const val = entry.tapeMeasurements![item.key as keyof typeof entry.tapeMeasurements];
                    return val && typeof val === 'object' && 'value' in val;
                  }) && (
                    <div>
                      <div className="mb-1.5 text-muted-foreground text-xs font-medium">Legs</div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                        {tapeGroups.legs.map(item => {
                          const val = entry.tapeMeasurements![item.key as keyof typeof entry.tapeMeasurements] as any;
                          if (!val || typeof val !== 'object' || !('value' in val)) return null;
                          return (
                            <div key={item.key} className="text-foreground text-sm">
                              <span className="text-muted-foreground text-xs">{item.label}: </span>
                              <span className="font-medium">{val.value} {val.unit}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          className="flex hover:bg-zinc-800 shrink-0 p-1.5 rounded-full text-muted-foreground hover:text-red-400 text-xs transition-colors"
          aria-label="Delete entry"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

