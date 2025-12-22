import { MoreHorizontal } from 'lucide-react';
import type { SessionStep } from '@/types/train';

interface SessionExerciseDisplayProps {
  step: SessionStep;
  onMenuOpen: () => void;
}

export function SessionExerciseDisplay({
  step,
  onMenuOpen,
}: SessionExerciseDisplayProps) {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-start justify-between">
        <div className="space-y-2 max-w-[85%]">
          <div className="flex items-center gap-2 text-brand-primary font-medium tracking-wide text-sm uppercase">
            <span>
              Round {step.setIndex + 1} / {step.totalSets}
            </span>
          </div>

          <h1 className="text-4xl font-bold leading-tight">
            {step.exercise.exercise.name}
          </h1>
        </div>

        <button
          onClick={onMenuOpen}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors shrink-0"
        >
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-4">
        {!step.exercise.exercise.bilateral && (
          <span className="px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-xs font-medium text-zinc-300 backdrop-blur-sm">
            single-sided
          </span>
        )}
        {step.block.workoutBlockType === 'warm-up' && (
          <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-xs font-medium text-orange-200 backdrop-blur-sm">
            warm up
          </span>
        )}
      </div>
    </div>
  );
}

