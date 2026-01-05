import { Flame } from 'lucide-react';
import type { TrainingStreak } from '@/app/train/actions';

interface StreakCardProps {
  streak: TrainingStreak;
}

export default function StreakCard({ streak }: StreakCardProps) {
  const hasStreak = streak.currentWeeks > 0;
  const isOnFire = streak.currentWeeks >= 4;

  return (
    <div className="bg-card card-gradient p-4 border border-white/5 rounded-(--radius) shadow-lg shadow-black/20">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2 rounded-lg ${isOnFire ? 'bg-brand-accent/10' : 'bg-white/5'}`}>
          <Flame className={`w-4 h-4 ${isOnFire ? 'text-brand-accent' : 'text-muted-foreground'}`} />
        </div>
        {!streak.isActiveThisWeek && hasStreak && (
          <span className="bg-warning/10 px-2 py-0.5 rounded-full ring-1 ring-warning/20 ring-inset font-medium text-warning text-xs">
            At risk
          </span>
        )}
      </div>
      <div className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
        Streak
      </div>
      <div className="font-display font-bold text-foreground text-2xl">
        {hasStreak ? (
          <>
            {streak.currentWeeks} {streak.currentWeeks === 1 ? 'week' : 'weeks'}
          </>
        ) : (
          'No streak'
        )}
      </div>
    </div>
  );
}
