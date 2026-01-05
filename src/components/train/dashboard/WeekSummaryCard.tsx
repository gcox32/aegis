import { Calendar } from 'lucide-react';
import type { WeekSummary } from '@/app/train/actions';

interface WeekSummaryCardProps {
  summary: WeekSummary;
}

function formatVolume(value: number, unit: string): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k ${unit}`;
  }
  return `${Math.round(value)} ${unit}`;
}

export default function WeekSummaryCard({ summary }: WeekSummaryCardProps) {
  return (
    <div className="bg-card card-gradient p-4 border border-white/5 rounded-(--radius) shadow-lg shadow-black/20">
      <div className="flex justify-between items-start mb-3">
        <div className="bg-white/5 p-2 rounded-lg">
          <Calendar className="w-4 h-4 text-brand-primary" />
        </div>
      </div>
      <div className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
        This Week
      </div>
      <div className="font-display font-bold text-2xl text-foreground">
        {summary.workoutsCompleted} {summary.workoutsCompleted === 1 ? 'workout' : 'workouts'}
      </div>
      {summary.totalVolume > 0 && (
        <div className="mt-1 text-muted-foreground text-sm">
          {formatVolume(summary.totalVolume, summary.volumeUnit)} moved
        </div>
      )}
    </div>
  );
}
