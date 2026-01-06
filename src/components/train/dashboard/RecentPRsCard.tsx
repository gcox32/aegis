import Link from 'next/link';
import { Trophy, Target } from 'lucide-react';
import { format } from 'date-fns';
import type { RecentPR } from '@/app/train/actions';

interface RecentPRsCardProps {
  prs: RecentPR[];
  keyExercises: { id: string; name: string }[];
}

export default function RecentPRsCard({ prs, keyExercises }: RecentPRsCardProps) {
  // No key exercises configured
  if (keyExercises.length === 0) {
    return (
      <div className="bg-card card-gradient p-4 border border-white/5 rounded-(--radius) shadow-lg shadow-black/20">
        <div className="flex justify-between items-start mb-3">
          <div className="bg-white/5 p-2 rounded-lg">
            <Target className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <div className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Key Lifts
        </div>
        <div className="font-display font-bold text-foreground text-lg">
          Not configured
        </div>
        <div className="mt-1 text-muted-foreground text-sm">
          <Link href="/me/goals/keys" className="text-brand-primary hover:underline">
            Set your key exercises
          </Link>{' '}
          to track PRs
        </div>
      </div>
    );
  }

  // Key exercises configured but no PRs yet
  if (prs.length === 0) {
    return (
      <div className="bg-card card-gradient p-4 border border-white/5 rounded-(--radius) shadow-lg shadow-black/20">
        <div className="flex justify-between items-start mb-3">
          <div className="bg-white/5 p-2 rounded-lg">
            <Trophy className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <div className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Key Lifts
        </div>
        <div className="font-display font-bold text-foreground text-lg">
          No PRs yet
        </div>
        <div className="mt-1 text-muted-foreground text-sm">
          Train your key exercises to track progress
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card card-gradient p-4 border border-white/5 rounded-(--radius) shadow-lg shadow-black/20">
      <div className="flex justify-between items-start mb-3">
        <div className="bg-success/10 p-2 rounded-lg">
          <Trophy className="w-4 h-4 text-success" />
        </div>
        <Link
          href="/me/goals/keys"
          className="text-muted-foreground hover:text-foreground text-xs transition-colors"
        >
          Edit
        </Link>
      </div>
      <div className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
        Key Lifts
      </div>
      <div className="space-y-2">
        {prs.map((pr, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="flex-1 mr-2 font-medium text-foreground text-sm truncate">
              {pr.exerciseName}
            </span>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-success">
                {pr.weight?.value || 0} {pr.weight?.unit || 'lbs'} for {pr.reps}
              </span>
              <span className="text-muted-foreground text-xs">
                {format(new Date(pr.date), 'MMM d')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
