import type { SessionStep } from '@/types/train';

interface SessionInputControlsProps {
  step: SessionStep;
  reps: string;
  onRepsChange: (value: string) => void;
  weight: string;
  onWeightChange: (value: string) => void;
  weightUnit: 'kg' | 'lbs';
  onWeightUnitChange: (unit: 'kg' | 'lbs') => void;
}

export function SessionInputControls({
  step,
  reps,
  onRepsChange,
  weight,
  onWeightChange,
  weightUnit,
  onWeightUnitChange,
}: SessionInputControlsProps) {
  return (
    <div className="gap-4 grid grid-cols-2 mb-8">
      {/* Reps */}
      <div className="flex flex-col gap-2">
        <label className="pl-1 font-medium text-zinc-400 text-xs uppercase tracking-wider">
          Reps
        </label>
        <div className="group relative">
          <input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={(e) => onRepsChange(e.target.value)}
            className="bg-zinc-900/80 px-4 py-5 border border-zinc-700/50 focus:border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary w-full font-bold placeholder:text-zinc-700 text-4xl text-center transition-all"
            placeholder={step.exercise.measures.reps?.toString() || '0'}
          />
          {step.exercise.measures.reps && (
            <div className="top-2 right-2 absolute font-mono text-[10px] text-zinc-500">
              Target: {step.exercise.measures.reps}
            </div>
          )}
        </div>
      </div>

      {/* Weight */}
      <div className="flex flex-col gap-2">
        <label className="pl-1 font-medium text-zinc-400 text-xs uppercase tracking-wider">
          Weight
        </label>
        <div className="group relative flex flex-col items-end gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
            className="bg-zinc-900/80 px-4 py-5 border border-zinc-700/50 focus:border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary w-full font-bold placeholder:text-zinc-700 text-4xl text-center transition-all"
            placeholder={
              step.exercise.measures.externalLoad?.value?.toString() || '0'
            }
          />
          <div className="float-right flex items-center gap-1 font-medium text-xs">
            <button
              type="button"
              onClick={() => onWeightUnitChange('kg')}
              className={`px-2 py-0.5 rounded-full border ${
                weightUnit === 'kg'
                  ? 'bg-brand-primary text-black border-brand-primary'
                  : 'bg-zinc-900/80 text-zinc-400 border-zinc-700'
              }`}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => onWeightUnitChange('lbs')}
              className={`px-2 py-0.5 rounded-full border ${
                weightUnit === 'lbs'
                  ? 'bg-brand-primary text-black border-brand-primary'
                  : 'bg-zinc-900/80 text-zinc-400 border-zinc-700'
              }`}
            >
              lbs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

