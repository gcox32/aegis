'use client';

import { useRouter } from 'next/navigation';
import { Play, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { WorkoutInstance, Workout } from '@/types/train';

interface ResumeWorkoutCardProps {
  instance: WorkoutInstance & { workout?: Workout };
}

export default function ResumeWorkoutCard({ instance }: ResumeWorkoutCardProps) {
  const router = useRouter();
  const workoutName = instance.workout?.name || 'Workout';
  const startedAgo = formatDistanceToNow(new Date(instance.date), { addSuffix: true });

  return (
    <div
      onClick={() => router.push(`/train/session/${instance.id}`)}
      className="
        relative overflow-hidden
        bg-linear-to-br from-brand-primary/15 to-brand-primary/5
        border border-brand-primary/20 hover:border-brand-primary/40
        rounded-(--radius)
        p-5
        cursor-pointer
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        hover:scale-[1.01] hover:shadow-xl hover:shadow-brand-primary/10
        active:scale-[0.99]
        group
      "
    >
      {/* Animated glow */}
      <div className="-top-20 -right-20 absolute bg-brand-primary/20 blur-3xl rounded-full w-40 h-40 animate-pulse" />

      <div className="z-10 relative flex items-center gap-4">
        {/* Icon */}
        <div className="bg-brand-primary/20 p-3 rounded-2xl ring-1 ring-brand-primary/30 group-hover:scale-110 transition-transform duration-300">
          <Play className="w-6 h-6 text-brand-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-brand-primary/20 px-2 py-0.5 rounded-full ring-1 ring-brand-primary/30 ring-inset font-medium text-brand-primary text-xs">
              In Progress
            </span>
          </div>
          <h3 className="font-display font-bold text-xl truncate tracking-tight">
            {workoutName}
          </h3>
          <p className="text-muted-foreground text-sm">
            Started {startedAgo}
          </p>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary transition-all group-hover:translate-x-1 duration-300" />
      </div>
    </div>
  );
}
