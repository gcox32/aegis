import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import type { MuscleGroupWork } from '@/app/train/actions';

interface MuscleGroupsCardProps {
  muscleGroups: MuscleGroupWork[];
}

function formatMuscleGroupName(name: string): string {
  // Capitalize first letter of each word
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function MuscleGroupsCard({ muscleGroups }: MuscleGroupsCardProps) {
  if (muscleGroups.length === 0) {
    return (
      <div className="bg-card card-gradient p-4 border border-white/5 rounded-(--radius) shadow-lg shadow-black/20">
        <div className="flex justify-between items-start mb-3">
          <div className="bg-white/5 p-2 rounded-lg">
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <div className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Muscle Focus (30 days)
        </div>
        <div className="font-display font-bold text-foreground text-lg">
          No data yet
        </div>
        <div className="mt-1 text-muted-foreground text-sm">
          Complete workouts to see muscle group breakdown
        </div>
      </div>
    );
  }

  const maxScore = muscleGroups[0]?.score || 1;
  const topGroups = muscleGroups.slice(0, 3);
  const bottomGroups = muscleGroups.length > 3
    ? muscleGroups.slice(-3).reverse()
    : [];

  return (
    <div className="bg-card card-gradient p-4 border border-white/5 rounded-(--radius) shadow-lg shadow-black/20">
      <div className="flex justify-between items-start mb-3">
        <div className="bg-brand-primary/10 p-2 rounded-lg">
          <Activity className="w-4 h-4 text-brand-primary" />
        </div>
      </div>
      <div className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
        Muscle Focus (30 days)
      </div>

      {/* Most Worked */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp className="w-3 h-3 text-success" />
          <span className="text-success text-xs font-medium">Most Worked</span>
        </div>
        <div className="space-y-2">
          {topGroups.map((mg) => {
            const percentage = (mg.score / maxScore) * 100;
            return (
              <div key={mg.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-foreground text-sm">
                    {formatMuscleGroupName(mg.name)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {mg.setCount} sets
                  </span>
                </div>
                <div className="bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-success h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Least Worked */}
      {bottomGroups.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingDown className="w-3 h-3 text-warning" />
            <span className="text-warning text-xs font-medium">Least Worked</span>
          </div>
          <div className="space-y-2">
            {bottomGroups.map((mg) => {
              const percentage = (mg.score / maxScore) * 100;
              return (
                <div key={mg.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-foreground text-sm">
                      {formatMuscleGroupName(mg.name)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {mg.setCount} sets
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-warning/60 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
